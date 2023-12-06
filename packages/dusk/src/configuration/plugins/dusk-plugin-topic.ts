import EventEmitter from 'events';

import { PluginFunction } from '../../index';

// declare module '../../index' {
//     interface DuskApplication {
//         $topic: EventEmitter;
//     }
// }

export function createDuskTopic(): PluginFunction {
    return app => {
        return {
            name: 'dusk-plugin-internal-topic',
            setup() {
                app.$topic = new EventEmitter();
            },
        };
    };
}
