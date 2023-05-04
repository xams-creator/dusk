import { PluginFunction, CreateDuskModelOptions, DuskModel } from '../../business';
import { DUSK_APPS_MODELS } from '../../common';
import Dusk, { DuskModelsOptions } from '../../index';

export function createDuskInternalModels(options: DuskModelsOptions): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-models',
            setup() {
                const createDuskModelOptions: CreateDuskModelOptions[] = [
                    ...(options || []),
                ];

                createDuskModelOptions.forEach((option) => {
                    app.define(option as any);
                });


                const models: DuskModel[] = (Reflect.getMetadata(DUSK_APPS_MODELS, Dusk) || []);
                models.forEach((model) => {
                    app.define(model);
                });

            },
        };
    };
}
