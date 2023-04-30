import { definePlugin } from '@xams-framework/dusk';
import { DuskContextOptions } from './index';

export default function createDuskContextWebpack(options: DuskContextOptions = {}) {
    return definePlugin({
        name: 'dusk-plugin-context-webpack',
        setup(app) {

        },
    });
}
