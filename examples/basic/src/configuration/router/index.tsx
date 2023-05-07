import { createBrowserRouter, RouteObject } from '@xams-framework/dusk';
import React from 'react';
import App from 'src/business/app';
import { Home, Login } from '@/business';

export function routes() {
    return [
        {
            path: '/',
            element: <App />,
            children: [
                {
                    path: '/login',
                    element: <Login />,
                },
                {
                    path: '/home',
                    element: <Home />,
                },
                {
                    path: '*',
                    element: <div>bar123s</div>,
                },
            ],
        },
    ] as RouteObject[];
}

export default createBrowserRouter(routes(), {
    basename: '/',
});
