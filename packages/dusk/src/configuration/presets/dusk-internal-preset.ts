import { PluginFunction } from '../../business';
import type { DuskOptions } from '../../types';

import { createDuskInternalEvent } from '../plugins/dusk-plugin-internal-event';
import { createDuskInternalScheduler } from '../plugins/dusk-plugin-internal-scheduler';
import { createDuskTopic } from '../plugins/dusk-plugin-topic';
import { createDuskInternalAxios } from '../plugins/dusk-plugin-internal-axios';
import { createDuskInternalRouter } from '../plugins/dusk-plugin-internal-router';
import { createDuskInternalRedux } from '../plugins/dusk-plugin-internal-redux';
import { createDuskInternalModels } from '../plugins/dusk-plugin-internal-models';
import { createDuskInternalApp } from '../plugins/dusk-plugin-internal-app';

/**
 * 内部默认预设
 *
 * @internal
 */
export default function createDuskInternalPreset({ models, redux, axios, router }: DuskOptions): PluginFunction {
    return () => {
        return {
            name: 'dusk-internal-preset',
            setup(app) {
                app
                    .use(createDuskInternalApp())
                    // .use(createDuskInternalContext())
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
