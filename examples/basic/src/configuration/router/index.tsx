import { createBrowserRouter, Outlet } from '@xams-framework/dusk';
import React from 'react';
import App from 'src/business/app';
// import App1 from 'src/business/app1';

function Home() {
    return <div>12344<Outlet /></div>;
}

export function routes() {
    return [
        {
            path: '/',
            element: <App />,
            children: [
                {
                    path: '/bar',
                    element: <div>bar</div>,
                },
                {
                    path: '*',
                    element: <div>bar123s</div>,
                },
            ],
        },
        // {
        //     path: '/app1',
        //     element: <App1 />,
        // },
        {
            path: '*',
            element: <div>404</div>,
        },
    ];
}

export default createBrowserRouter(routes(), {
    basename: '/',
});
