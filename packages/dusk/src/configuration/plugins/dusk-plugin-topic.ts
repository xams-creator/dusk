import { PluginFunction } from '../../index';
import EventEmitter from 'events';

// declare module '../../index' {
//     interface DuskApplication {
//         $topic: EventEmitter;
//     }
// }

export function createDuskTopic(): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-topic',
            setup() {
                app.$topic = new EventEmitter();
            },
        };
    };
}
