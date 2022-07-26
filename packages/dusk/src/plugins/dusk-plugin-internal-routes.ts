import Dusk, {
    PluginFactory,
    isFunction,
    isEmpty,
    DUSK_APPS_ROUTES,
    AppRoutesConfig,
} from '../index';
import { RouteConfig } from 'react-router-config';

export function createDuskInternalRoutes(routes: AppRoutesConfig): PluginFactory {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-routes',
            setup() {
                const { render } = app._options;
                if (!routes) {
                    routes = app._contexts.configuration['routes'];
                }
                if (isFunction(routes)) {
                    routes = (routes as Function)(render);
                }
                if (isEmpty(routes)) {
                    routes = [
                        {
                            render: render,
                        },
                    ];
                }
                app._routes = Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk).concat((routes as RouteConfig[]));
            },
        };
    };
}
