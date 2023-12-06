import { Router as RemixRouter } from '@remix-run/router';
import Dusk, { DuskApplication, Location, PluginHookContext, definePlugin } from '@xams-framework/dusk';

interface DuskRouteGuardOptions {
    router?: RemixRouter;
}

declare module '@xams-framework/dusk' {
    interface Plugin {
        onRouteBefore?: <Context extends PluginHookContext = PluginHookContext>(
            ctx: Context,
            next: Function,
            prevLocation: Location
        ) => void;
        onRouteAfter?: <Context extends PluginHookContext = PluginHookContext>(
            ctx: Context,
            next: Function,
            prevLocation: Location,
            nextLocation: Location
        ) => void;
    }
}

Dusk.configuration.plugin.hooks.push(...['onRouteBefore', 'onRouteAfter']);

export default function createRouteGuard(options: DuskRouteGuardOptions = {}) {
    return definePlugin({
        name: 'dusk-plugin-route-guard',
        setup(app) {
            const router = options.router || app.$router;
            if (!router) {
                return;
            }
            // @ts-ignore
            router._navigate = router.navigate;
            router.navigate = interceptor(app, router.navigate);
        },
    });
}

function interceptor(app: DuskApplication, fn: RemixRouter['navigate']) {
    let prevLocation: Location | null = null;
    let nextLocation: Location | null = null;

    return function () {
        // @ts-ignore
        const it: Router = this;

        prevLocation = it.state.location;
        // 在方法执行前做一些拦截处理
        console.log(it.state.location, arguments);

        // @ts-ignore
        const ret = fn.apply(it, arguments);

        ret.finally(() => {
            nextLocation = it.state.location;
            console.log(it.state.location);
        });
        return ret;
    };
}
