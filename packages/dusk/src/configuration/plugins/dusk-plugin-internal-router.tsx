import React from 'react';
import {
    RouteObject,
    createBrowserRouter,
    createHashRouter,
    createMemoryRouter,
    createRoutesFromElements,
} from 'react-router-dom';

import { Router as RemixRouter } from '@remix-run/router';

import { DUSK_APPS_ROUTES, MODE } from '../../common';
import { DuskApplication, DuskRouterOptions, PluginFunction } from '../../index';
import Dusk from '../../index';

function join(routes: RouteObject[]): RouteObject[] {
    Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk).forEach((route: RouteObject) => {
        routes.unshift(route);
        // route.id = "4"
        // route.hasErrorBoundary = false;
    });
    return routes;
}

function isRemixRouter(router: RemixRouter) {
    return router.hasOwnProperty('initialize');
}

export function initializeRouter(app: DuskApplication, router: DuskRouterOptions): RemixRouter {
    if (!router) {
        return;
    }

    if (app.$router) {
        app.$logger.warn('Please make sure that router is provided only once because Router already exists! ');
        return;
    }

    if (app._started) {
        app.$logger.warn('Please call before the startup method!');
        return;
    }

    if (isRemixRouter(router as RemixRouter)) {
        app.$router = router as RemixRouter;
        join(app.$router.routes);
        return;
    }

    let routes: RouteObject[] = [];
    if (Array.isArray(router.routes)) {
        routes = join(router.routes);
    } else if (React.isValidElement(router.routes)) {
        routes = join(createRoutesFromElements(router.routes));
    }

    // @ts-ignore
    const options = router.options || {};

    switch (app.mode) {
        case MODE.HASH:
            app.$router = createHashRouter(routes, options);
            break;
        case MODE.MEMORY:
            app.$router = createMemoryRouter(routes, options);
            break;
        case MODE.BROWSER:
            app.$router = createBrowserRouter(routes, options);
            break;
        default:
            app.$logger.warn('unknown app mode! will use browser router , please check your app options.mode');
            app.$router = createBrowserRouter(routes, options);
            break;
    }
}

export function createDuskInternalRouter(router: DuskRouterOptions): PluginFunction {
    return app => {
        return {
            name: 'dusk-plugin-internal-router',
            setup() {
                initializeRouter(app, router);
            },
        };
    };
}
