import { PluginFunction } from '../../business/plugin';
import type { DuskOptions } from '../../types';

import { createDuskInternalContext } from '../plugins/dusk-plugin-internal-context';
import { createDuskInternalEvent } from '../plugins/dusk-plugin-internal-event';
import { createDuskInternalScheduler } from '../plugins/dusk-plugin-internal-scheduler';
import { createDuskTopic } from '../plugins/dusk-plugin-topic';
import { createDuskInternalAxios } from '../plugins/dusk-plugin-internal-axios';
import { createDuskInternalRouter } from '../plugins/dusk-plugin-internal-router';
import { createDuskInternalRedux } from '../plugins/dusk-plugin-internal-redux';
import { createDuskInternalModels } from '../plugins/dusk-plugin-internal-models';


export default function createDuskPresetInternal({ models, redux, axios, router }: DuskOptions): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-preset-internal',
            setup(app) {
                app
                    .use(createDuskInternalContext())
                    .use(createDuskInternalEvent())
                    .use(createDuskInternalScheduler())
                    .use(createDuskTopic())
                    // .use(createDuskInternalModelManager())
                    .use(createDuskInternalAxios(axios))
                    // .use(createDuskInternalComponentManager())
                    // .use(createDuskInternalRoutes(routes))
                    .use(createDuskInternalRouter(router))
                    .use(createDuskInternalRedux(redux))
                    .use(createDuskInternalModels(models))
                ;
            },
        };
    };
}
