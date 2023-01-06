// import { PluginFunction } from '../../business';
// import { DUSK_APPS_COMPONENTS, DUSK_APPS_MODELS } from '../../common';
// import Dusk, { DuskModelsOptions } from '../../index';
// import { CreateDuskModelOptions, DuskModel } from '../../business/model/types';
// import { ComponentOptions } from '../../business/component/types';
//
// export function createDuskInternalComponents(options: DuskModelsOptions): PluginFunction {
//     return (app) => {
//         return {
//             name: 'dusk-plugin-internal-components',
//             setup() {
//                 const components: ComponentOptions[] = Reflect.getMetadata(DUSK_APPS_COMPONENTS, Dusk).concat([]);
//                 components.forEach((component) => {
//                     app._cm.use(component);
//                 });
//
//                 const createDuskModelOptions: CreateDuskModelOptions[] = [
//                     ...(options?.models || []),
//                 ];
//
//                 createDuskModelOptions.forEach((option) => {
//                     app.define(option as any);
//                 });
//
//                 const models: DuskModel[] = (Reflect.getMetadata(DUSK_APPS_MODELS, Dusk) || []);
//                 models.forEach((model) => {
//                     app._mm.use(model);
//                 });
//
//                 if (Dusk.configuration.experimental.context) {
//                     // @ts-ignore
//                     let modules = require.context((process.env.REACT_APP_PATH_SRC_ALIAS_NAME || 'src') + '/business', true, /model\.(tsx|ts|js|jsx)$/);
//                     modules.keys().forEach((key) => {
//                         const model: DuskModel = modules(key).default;
//                         if (model) {
//                             app._mm.use(model);
//                         }
//                     });
//                 }
//             },
//         };
//     };
// }
