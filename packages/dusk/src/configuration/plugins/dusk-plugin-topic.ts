import { PluginFunction } from '../../index';
import EventEmitter from 'events';


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
