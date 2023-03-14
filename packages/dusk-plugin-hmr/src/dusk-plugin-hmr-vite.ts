import { definePlugin } from '@xams-framework/dusk';
import { DuskHmrOptions } from './index';

interface DuskHmrViteOptions extends DuskHmrOptions {

}

export default function createDuskHmrVite(options: DuskHmrViteOptions = {}) {
    return definePlugin({
        name: 'dusk-plugin-hmr-vite',
        setup(app) {
            // @ts-ignore
            if (import.meta.hot) {
                // @ts-ignore
                import.meta.hot.on('vite:afterUpdate', (e) => {
                    options?.onHmr(app);
                });
            }
        },
    });
}
