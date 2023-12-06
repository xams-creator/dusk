import { PluginFunction, definePlugin } from '../../business';
import { isProduction } from '../../common';
import type { DuskOptions } from '../../types';
import { createDuskInternalApp } from '../plugins/dusk-plugin-internal-app';
import { createDuskInternalAxios } from '../plugins/dusk-plugin-internal-axios';
import { createDuskInternalComponents } from '../plugins/dusk-plugin-internal-components';
import { createDuskInternalEvent } from '../plugins/dusk-plugin-internal-event';
import { createDuskInternalModels } from '../plugins/dusk-plugin-internal-models';
import { createDuskInternalRedux } from '../plugins/dusk-plugin-internal-redux';
import { createDuskInternalRouter } from '../plugins/dusk-plugin-internal-router';
import { createDuskInternalScheduler } from '../plugins/dusk-plugin-internal-scheduler';
import { createDuskTopic } from '../plugins/dusk-plugin-topic';

/**
 * 内部默认预设
 *
 * @internal
 */
export default function createDuskInternalPreset({
    models,
    redux,
    axios,
    router,
    components,
}: DuskOptions): PluginFunction {
    return definePlugin({
        name: 'dusk-internal-preset',
        setup(app) {
            app.use(createDuskInternalApp())
                .use(createDuskInternalEvent())
                .use(createDuskInternalScheduler())
                .use(createDuskTopic())
                // .use(createDuskInternalModelManager())
                .use(createDuskInternalAxios(axios))
                // .use(createDuskInternalComponentManager())
                // .use(createDuskInternalRoutes(routes))
                .use(createDuskInternalRouter(router))
                .use(
                    createDuskInternalRedux({
                        devTools: !isProduction(),
                        ...redux,
                    })
                )
                .use(createDuskInternalModels(models))
                .use(createDuskInternalComponents(components));
        },
    });
}
