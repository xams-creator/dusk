import Dusk, { PluginFunction, PluginHookContext, isProduction } from '@xams-framework/dusk';
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
        __DUSK_PLUGIN_HMR_STATUS_HANDLER: Function;
    }
}

type Status = 'check' | 'prepare' | 'dispose' | 'apply' | 'idle';

declare const module: {
    hot: {
        addStatusHandler: (status) => Function
        removeStatusHandler: (callback: Function) => void
    }
};


// function supportHMR() {
//     // @ts-ignore
//     if (module.hot) {
//         // @ts-ignore
//         if (module.hot.status() === 'idle') {
//             return true;
//         }
//     }
//     return false;
// }

interface DuskHmrOptions {
    disposeApp?: boolean;
}

export default function createDuskHmr(options: DuskHmrOptions = {
    disposeApp: false,
}): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-hmr',
            setup() {
                if (!isProduction() && module.hot) {
                    if (!Dusk.configuration.hmr) {
                        Dusk.configuration.hmr = true;
                        module.hot.removeStatusHandler(window.__DUSK_PLUGIN_HMR_STATUS_HANDLER);
                        window.__DUSK_PLUGIN_HMR_STATUS_HANDLER = (status) => {
                            switch (status) {
                                case 'check':
                                case 'prepare':
                                    break;
                                case 'dispose':
                                    // if (options.disposeApp) {
                                    //     app.destroy();
                                    // } else {
                                    //     app._pm.dispose();
                                    //     app._mm.dispose();
                                    //     // @ts-ignore
                                    //     app._cm.dispose();
                                    // }
                                    break;
                                case 'apply':
                                    break;
                                case 'idle':
                                    setTimeout(() => {
                                        app._pm.apply(APP_HOOKS_ON_HMR);
                                    });
                                    break;
                                default:
                                    break;
                            }
                        };
                        module.hot.addStatusHandler(window.__DUSK_PLUGIN_HMR_STATUS_HANDLER);
                    }
                }
            },
        };
    };
};

// app.use(createDuskHmr(
//     {
//         accept: () => {
//             module.hot.decline();
//             module.hot.accept(() => {
//                 app.startup();
//             });
//         },
//     },
// ));
