import Dusk, { PluginFunction, PluginHookContext, isProduction } from '@xams-framework/dusk';

/*
*   todo：目前版本hook name 为 string，在这种情况下可能不安全，因为可以通过 emit(string) 破坏规则.
*    后面可以尝试使用 Symbol.for(key),Symbol.keyFor(symbol)
* **/

// const APP_HOOKS_ON_HMR = Symbol.for('onHmr');
const APP_HOOKS_ON_HMR = 'onHmr';
Dusk.configuration.plugin.hooks.push(APP_HOOKS_ON_HMR);

declare module '@xams-framework/dusk' {
    interface Plugin {
        onHmr?: (ctx: PluginHookContext, next: Function) => void;
    }
}

declare var module: {
    hot: {
        addStatusHandler: (status) => {}
    }
};


function supportHMR() {
    // @ts-ignore
    if (module.hot) {
        // @ts-ignore
        if (module.hot.status() === 'idle') {
            return true;
        }
    }
    return false;
}

export default function createDuskHmr(options?: any): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-hmr',
            setup() {
                if (!isProduction() && module.hot && !Dusk.configuration.hmr) {
                    module.hot.addStatusHandler((status) => {
                        status === 'idle' && app._pm.apply(APP_HOOKS_ON_HMR);
                    });
                    Dusk.configuration.hmr = true;
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
