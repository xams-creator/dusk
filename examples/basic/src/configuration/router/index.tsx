import React from 'react';

import { RouteObject, createBrowserRouter } from '@xams-framework/dusk';

import { Home, Login } from '@/business';

import App from 'src/business/app';

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
