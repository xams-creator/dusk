import { PluginFunction } from '../../business';
import { DUSK_APPS_MODELS } from '../../common';
import Dusk, { DuskModelsOptions } from '../../index';
import { CreateDuskModelOptions, DuskModel } from '../../business/model/types';

export function createDuskInternalModels(options: DuskModelsOptions): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-models',
            setup() {
                const createDuskModelOptions: CreateDuskModelOptions[] = [
                    ...(options?.models || []),
                ];

                createDuskModelOptions.forEach((option) => {
                    app.define(option);
                });

                const models: DuskModel[] = (Reflect.getMetadata(DUSK_APPS_MODELS, Dusk) || []);
                models.forEach((model) => {
                    app._mm.use(model);
                });

            },
        };
    };
}
