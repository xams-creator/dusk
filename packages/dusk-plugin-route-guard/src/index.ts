import Dusk, { PluginContext, PluginFactory } from '@xams-framework/dusk';

interface IOptions {
    isLoggedIn: () => boolean;

    getLoginPath?: () => string;
    getHomePath?: () => string;
    getROOTPath?: () => string;
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
        getLoginPath = () => '/user/login',
        getHomePath = () => '/home',
        getROOTPath = () => '/',
    } = options || {};

    return (app) => {
        const history = app.$history;
        return {
            name: 'dusk-plugin-route-guard',
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
                    history.push(getLoginPath());
                }
                if (history.location.pathname === getROOTPath()) {
                    history.replace(getHomePath());
                }
                next();
            },
            onRoute(ctx, next, name, method, ...args: any[]) {
                next();
                if (!isLoggedIn()) {
                    method.apply(null, [getLoginPath()]);
                    return;
                }
                method.apply(null, args);
            },
        };
    };
};
