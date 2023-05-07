import React, { useCallback, useEffect, useState } from 'react';
import 'src/business/app/index.css';

import {
    useNamespacedSelector,
    toString,
    useDispatch,
    Outlet,
    Link,
    useLocation,
    useNavigation, useNavigate,
    APP_HOOKS_ON_ROUTE_AFTER, APP_HOOKS_ON_ROUTE_BEFORE, useDusk,
} from '@xams-framework/dusk';
import model, { AppState } from '@/business/inject/models/app.model';
import { Location } from '@remix-run/router';

export function RouteMonitor() {
    const location: Location = useLocation();
    const [previousLocation, setPreviousLocation] = useState<Location | null>(location);
    const { emit } = useDusk();
    useEffect(() => {
        if (previousLocation && previousLocation.pathname !== location.pathname) {
            emit(APP_HOOKS_ON_ROUTE_BEFORE, previousLocation, location);
            setPreviousLocation(location);
            console.log(`Route changed from ${previousLocation.pathname} to ${location.pathname}`);
            emit(APP_HOOKS_ON_ROUTE_AFTER, previousLocation, location);
        }
    }, [emit, location, previousLocation]);
    return null;
}

function App() {
    const state: AppState = useNamespacedSelector('app');
    const dispatch = useDispatch();

    return (
        <div className='App'>
            {/*<RouteMonitor />*/}
            <button disabled={state.pending} onClick={() => {
                dispatch(model.commands.add({ payload: 66666 })).then((res) => {
                    console.log('请求结束...');
                    alert(res);
                });
            }}>++
            </button>
            count {state.value} 11111
            <br />
            <Link to={'/'}> TO /</Link>
            <Link to={'home'}>TO HOME</Link>
            <Outlet />
        </div>
    );
}

export default App;
