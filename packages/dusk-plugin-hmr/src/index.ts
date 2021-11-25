import Dusk, { APP_HOOKS_ON_HMR, PluginFactory } from '@xams-framework/dusk';

/*
*  @xams-framework/dusk(0.22): 当前版本 onHmr 是内置的。后面将使用下面的代码，同时移除内置hmr处理
* **/
// Dusk.configuration.plugin.hooks = Dusk.configuration.plugin.hooks.concat([
//     'onHmr',
// ]);
//
// declare module '@xams-framework/dusk' {
//     interface Plugin {
//         onHmr?: (ctx: PluginContext, next: Function) => void;
//     }
// }

declare var module: any;

export default function createDuskHmr(options?: any): PluginFactory {
    return (app) => {
        if (module.hot && !Dusk.configuration.experimental.hmr) {
            module.hot.addStatusHandler((status) => {
                status === 'idle' && app._pm.apply(APP_HOOKS_ON_HMR);
            });
            Dusk.configuration.experimental.hmr = true;
        }
        return {
            name: 'dusk-plugin-hmr',
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
