import { Button, Grid, MenuItem, Select } from '@material-ui/core'
import { Loader } from 'google-maps';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Route } from '../util/models';

const API_URL = process.env.REACT_APP_API_URL;

const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

type Props = {
    
};

export const Mapping = (props: Props) => {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [routeISelected, setRouteIdSelected] = useState<string>("")
    const mapRef = useRef<google.maps.Map>();

    useEffect(() => {
        fetch(`${API_URL}/routes`)
        .then(data => data.json())
        .then(data => setRoutes(data))
    }, [])

    useEffect(() => {
         (async () => {
            await googleMapsLoader.load();
         })()
        
    }, [])

    const startRoute = useCallback((event: FormEvent) => {
        event.preventDefault();

        console.log(routeISelected);
    }, [routeISelected]);

    return (
        <Grid container>
            <Grid item xs={12} sm={3}>
                <form onSubmit={startRoute}>
                    <Select fullWidth value={routeISelected} onChange={(ev) => setRouteIdSelected(ev.target.value + "")}>
                        <MenuItem value="">
                            <em> Selecione uma corrida</em>
                        </MenuItem>
                        {routes.map((route, key) => (
                            <MenuItem key={key} value={route._id}>
                               {route.title}
                            </MenuItem>
                        ) )}
                        
                    </Select>
                    <Button type='submit' color="primary" variant='contained'>Iniciar corrida</Button>
                </form>
            </Grid>
            <Grid item xs={12} sm={9}>Mapa</Grid>
        </Grid>
    );
};