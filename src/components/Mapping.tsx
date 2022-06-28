import { FormEvent, FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Grid, makeStyles, MenuItem, Select } from '@material-ui/core'
import { Loader } from 'google-maps';

import { getCurrentPosition } from '../util/geolocation';
import { Route } from '../util/models';
import { makeCarIcon, makeMarkerIcon, Map } from '../util/map';
import { sample, shuffle } from 'lodash';
import { RouteExistsError } from '../errors/route-exists.error';
import { useSnackbar } from 'notistack';
import { Navbar } from './Navbar';

const API_URL = process.env.REACT_APP_API_URL;

const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

const colors = [
    "#b71c1c",
    "#4a148c",
    "#2e7d32",
    "#e65100",
    "#2962ff",
    "#c2185b",
    "#FFCD00",
    "#3e2723",
    "#03a9f4",
    "#827717",
  ];


const useStyles = makeStyles({
    root: {
      width: "100%",
      height: "100%",
    },
    form: {
      margin: "16px",
    },
    btnSubmitWrapper: {
      textAlign: "center",
      marginTop: "8px",
    },
    map: {
      width: "100%",
      height: "100%",
    },
});

export const Mapping: FunctionComponent = () => {
    const classes = useStyles();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [routeIdSelected, setRouteIdSelected] = useState<string>("");
    const mapRef = useRef<Map>();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetch(`${API_URL}/routes`)
        .then(data => data.json())
        .then(data => setRoutes(data))
    }, [])

    useEffect(() => {
         (async () => {
           const [, position] =  await Promise.all([googleMapsLoader.load(), getCurrentPosition({enableHighAccuracy: true})])
        
           const divMap = document.getElementById('map') as HTMLElement;

            mapRef.current = new Map(divMap, {
                zoom: 15,
                center: position,
            })
        })();
    }, [])

    const startRoute = useCallback((event: FormEvent) => {
        event.preventDefault();

        const route = routes.find(route => route._id  === routeIdSelected)
        const color = sample(shuffle(colors)) as string;

        try{
            mapRef.current?.addRoute(routeIdSelected, {
                currentMarkerOptions:{
                   position: route?.startPosition,
                   icon: makeCarIcon(color)
                },
                endMarkerOptions: {
                    position: route?.endPosition,
                    icon: makeMarkerIcon(color)
                }
            })
        }catch(err){
            if (err instanceof RouteExistsError){
                enqueueSnackbar(`${route?.title} já adicionado, espere finalizar`, {variant: 'error'})

                return;
            }
            throw err;
        }
        
    }, [routeIdSelected, routes, enqueueSnackbar]);

    return (
        <Grid className={classes.root} container >
            <Grid item xs={12} sm={3}>
            <Navbar />
                <form className={classes.form} onSubmit={startRoute}>
                    <Select fullWidth value={routeIdSelected} onChange={(ev) => setRouteIdSelected(ev.target.value + "")}>
                        <MenuItem value="">
                            <em> Selecione uma corrida</em>
                        </MenuItem>
                        {routes.map((route, key) => (
                            <MenuItem key={key} value={route._id}>
                               {route.title}
                            </MenuItem>
                        ) )}
                        
                    </Select>
                    <div className={classes.btnSubmitWrapper}><Button type='submit' color="primary" variant='contained'>Iniciar corrida</Button></div>
                </form>
            </Grid>
            <Grid  item xs={12} sm={9}>
                <div id="map" className={classes.map}></div>
            </Grid>
        </Grid>
    );
};