import { PluginFunction, ComponentOptions } from '../../business';
import { DUSK_APPS_COMPONENTS, isArray } from '../../common';
import Dusk, { DuskComponentsOptions } from '../../index';

export function createDuskInternalComponents(options: DuskComponentsOptions): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-components',
            setup() {
                if (options && isArray(options)) {
                    options.forEach((component) => {
                        app.component(component);
                    });
                }
                const components: ComponentOptions[] = Reflect.getMetadata(DUSK_APPS_COMPONENTS, Dusk).concat([]);
                components.forEach((component) => {
                    app.component(component);
                });
                // if (Dusk.configuration.experimental.context) {
                //     // @ts-ignore
                //     let modules = require.context((process.env.REACT_APP_PATH_SRC_ALIAS_NAME || 'src') + '/business', true, /model\.(tsx|ts|js|jsx)$/);
                //     modules.keys().forEach((key) => {
                //         const model: DuskModel = modules(key).default;
                //         if (model) {
                //             app._mm.use(model);
                //         }
                //     });
                // }
            },
        };
    };
}
