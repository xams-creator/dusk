import { createBrowserRouter, Outlet } from '@xams-framework/dusk';
import React from 'react';
import App from 'src/business/app';
import { Home } from '@/business';

export function routes() {
    return [
        {
            path: '/',
            element: <App />,
            children: [
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
    ];
}

export default createBrowserRouter(routes(), {
    basename: '/',
});
