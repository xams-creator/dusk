import { PluginFunction } from '../../business/plugin';
import { DUSK_APPS_MODELS } from '../../common';
import Dusk, { DuskModelsOptions } from '../../index';
import { ModelDefinition } from '../../business/model';

export function createDuskInternalModels(options: DuskModelsOptions): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-models',
            setup() {

            },
            onReady(ctx, next) {
                const models: ModelDefinition[] = [
                    ...(options?.models || []),
                    ...(Reflect.getMetadata(DUSK_APPS_MODELS, Dusk) || []),
                ];

                models.forEach((model) => {
                    app.define(model);
                });

                next();
            },
        };
    };
}
