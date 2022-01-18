import Dusk, { PluginContext, PluginFactory } from '@xams-framework/dusk';

interface IOptions {
    isLoggedIn: () => boolean;
    paths?: {
        login?: string
        home?: string
        root?: string
    };
}

declare module '@xams-framework/dusk' {
    interface PluginExtraHooks {
        onRoute?: (
            ctx: PluginContext,
            next: Function,
            name: 'push' | 'replace' | 'go' | 'goBack' | 'goForward',
            method: Function,
            args: any[],
        ) => void;
    }
}
Dusk.configuration.plugin.hooks.push('onRoute');

export default function createRouteGuard(options?: IOptions): PluginFactory {
    const {
        isLoggedIn = () => false,
        paths = {
            root: '/',
            login: '/user/login',
            home: '/home',
        },
    } = options || {};

    return (app) => {
        const history = app.$history;
        return {
            name: 'dusk-route-guard',
            setup() {
                [
                    'push',
                    'replace',
                    'go',
                    'goBack',
                    'goForward',
                ].forEach((name) => {
                    const method = history[name];
                    history[name] = (...args) => {
                        app._pm.apply('onRoute', name, method, ...args);
                    };
                });
            },
            onReady(ctx, next) {
                if (!isLoggedIn()) {
                    history.push(paths.login);
                }
                if (history.location.pathname === paths.root) {
                    history.replace(paths.home);
                }
                next();
            },
            onRoute(ctx, next, name, method, ...args: any[]) {
                next();
                if (!isLoggedIn()) {
                    method.apply(null, [paths.login]);
                    return;
                }
                method.apply(null, args);
            },
        };
    };
};
