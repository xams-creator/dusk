import Dusk, { PluginHookContext, isProduction, definePlugin, DuskApplication } from '@xams-framework/dusk';
import createDuskHmrWebpack from './dusk-plugin-hmr-webpack';
import createDuskHmrVite from './dusk-plugin-hmr-vite';
// const APP_HOOKS_ON_HMR = Symbol.for('onHmr');
const APP_HOOKS_ON_HMR = 'onHmr';
Dusk.configuration.plugin.hooks.push(APP_HOOKS_ON_HMR);

declare module '@xams-framework/dusk' {
    interface DuskApplication {
        $hmr: any;
    }

    interface Plugin {
        onHmr?: (ctx: PluginHookContext, next: Function) => void;
    }
}

declare global {
    interface Window {
        __DUSK_PLUGIN_HMR_APP_RUNTIME__: DuskApplication;
    }
}

export interface DuskHmrOptions {
    onHmr?: (app: DuskApplication) => void;
}

export default function createDuskHmr(options: DuskHmrOptions = {}) {
    return definePlugin({
        name: 'dusk-plugin-hmr',
        setup(app) {
            if (!isProduction()) {
                Dusk.configuration.hmr = true;
                window.__DUSK_PLUGIN_HMR_APP_RUNTIME__ = app;

                function onHmr(app: DuskApplication) {
                    app._pm.apply(APP_HOOKS_ON_HMR);
                }

                const opts = { onHmr };

                if (inWebpack()) {
                    app.use(createDuskHmrWebpack(opts));
                }
                if (inVite()) {
                    app.use(createDuskHmrVite(opts));
                }
            }
        },
    });
}

function inWebpack() {
    // @ts-ignore
    return !!import.meta.webpackHot;
}

function inVite() {
    // @ts-ignore
    return !!import.meta.hot;
}

