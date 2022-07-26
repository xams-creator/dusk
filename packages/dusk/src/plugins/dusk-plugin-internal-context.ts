import Dusk, { PluginFactory } from '../index';
import * as logger from '../util/logger';

export function createDuskInternalContext(): PluginFactory {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-context',
            setup() {
                const contexts = app._contexts = {
                    configuration: {
                        redux: null,
                        routes: null,
                    },
                };
                if (Dusk.configuration.experimental.context) {
                    // @ts-ignore
                    let modules = require.context('@/business', true, /\.(tsx|ts|js|jsx)$/);
                    modules.keys().forEach((key) => {
                        modules(key);
                    });
                    // @ts-ignore
                    if (process.env.APP_PATH_CONFIGURATION) {
                        Object.keys(contexts.configuration).map((id) => {
                            try {
                                // const module = await import(`${process.env.APP_PATH_CONFIGURATION}/${id}`);
                                // contexts.configuration[id] = module.default;
                                // contexts.configuration[id] = modules('./' + id).default;
                                // const module = require(`${process.env.APP_PATH_CONFIGURATION}/${id}`);
                                // @ts-ignore
                                const module = require(`@/configuration/${id}`);
                                contexts.configuration[id] = module.default;
                            } catch (e) {
                                logger.warn(e);
                            }
                        });
                    }
                }
            },
        };
    };
}
