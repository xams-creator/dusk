import Dusk, { PluginFunction } from '../../index';

export function createDuskInternalContext(): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-context',
            setup() {
                // const contexts = app._contexts = {
                //     configuration: {
                //         redux: null,
                //         routes: null,
                //     },
                // };
                if (Dusk.configuration.experimental.context) {
                    // @ts-ignore
                    let modules = require.context((process.env.REACT_APP_PATH_SRC_ALIAS_NAME || 'src') + '/business', true, /\.(tsx|ts|js|jsx)$/);
                    modules.keys().forEach((key) => {
                        modules(key);
                    });
                    // @ts-ignore
                    // if (process.env.APP_PATH_CONFIGURATION) {
                    //     Object.keys(contexts.configuration).map((id) => {
                    //         try {
                    //             // const module = await import(`${process.env.APP_PATH_CONFIGURATION}/${id}`);
                    //             // contexts.configuration[id] = module.default;
                    //             // contexts.configuration[id] = modules('./' + id).default;
                    //             // @ts-ignore
                    //             const module = require(`${process.env.REACT_APP_PATH_SRC_ALIAS_NAME}/configuration/${id}`);
                    //             // @ts-ignore
                    //             // const module = require(process.env.REACT_APP_PATH_SRC_ALIAS_NAME + `/configuration/${id}`);
                    //             contexts.configuration[id] = module.default;
                    //         } catch (e) {
                    //             logger.warn(e);
                    //         }
                    //     });
                    // }
                }
            },
        };
    };
}
