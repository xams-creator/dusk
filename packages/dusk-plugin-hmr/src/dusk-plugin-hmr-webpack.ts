import { definePlugin } from '@xams-framework/dusk';
import { DuskHmrOptions } from './index';

interface DuskHmrWebpackOptions extends DuskHmrOptions {

}

export default function createDuskHmrWebpack(options: DuskHmrWebpackOptions = {}) {
    return definePlugin({
        name: 'dusk-plugin-hmr-webpack',
        setup(app) {
            // @ts-ignore
            if (import.meta.webpackHot) {

                // @ts-ignore
                import.meta.webpackHot.removeStatusHandler(window.__DUSK_PLUGIN_HMR_STATUS_HANDLER__);

                // @ts-ignore
                window.__DUSK_PLUGIN_HMR_STATUS_HANDLER__ = (status: Status) => {
                    switch (status) {
                        case 'check':
                        case 'prepare':
                            break;
                        case 'dispose':
                            break;
                        case 'apply':
                            break;
                        case 'idle':
                            setTimeout(() => {
                                options?.onHmr(app);
                            });
                            break;
                        default:
                            break;
                    }
                };

                // @ts-ignore
                import.meta.webpackHot.addStatusHandler(window.__DUSK_PLUGIN_HMR_STATUS_HANDLER__);
            }
        },
    });
}
