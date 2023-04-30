import { definePlugin } from '@xams-framework/dusk';
import { DuskContextOptions } from './index';


export default function createDuskContextVite(options: DuskContextOptions) {
    return definePlugin({
        name: 'dusk-plugin-context-vite',
        setup(app) {

        },
    });
}
