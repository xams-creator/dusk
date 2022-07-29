import { PluginFactory } from '../index';
import EventEmitter from 'events';


export function createDuskInternalTopic(): PluginFactory {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-topic',
            setup() {
                app.$topic = new EventEmitter();
            },
        };
    };
}
