import * as React from 'react';

import Dusk, {RouteConfig} from '@xams-framework/dusk';

import App, {App1, App1Detail, App2, Demo} from './app';

window.pro = process.env;
const app = new Dusk({
    container: '#root',
    history: {
        mode: 'hash'
    },
    routes(render): RouteConfig[] {
        return [
            {
                path: ['/demo'],
                exact: true,
                component: Demo,
            },
            {
                path: ['/'],
                render: render,
                routes: [
                    {
                        path: ['/about'],
                        component: App1,
                        routes: [
                            {
                                path: ['/about/:id'],
                                component: App1Detail,
                            },
                        ]
                    },
                    {
                        path: ['/dashboard'],
                        component: App2
                    },
                ]
            }
        ];
    },
    render(props) {
        return <App route={props.route}/>;
    }
});


window.app = app;
app.startup();

