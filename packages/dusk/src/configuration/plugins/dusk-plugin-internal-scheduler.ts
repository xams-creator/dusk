import { PluginFunction, isFunction, logger } from '../../index';

const tick = Promise.resolve();
const queue = [];
let queued = false;

export function scheduler(fn: Function) {
    if (!isFunction(fn)) {
        logger.error('fn not is a function!');
        return;
    }
    queue.push(fn);
    if (!queued) {
        queued = true;
        tick.then(flush);
    }
}

function flush() {
    for (let i = 0; i < queue.length; i++) {
        queue[i]();
    }
    queue.length = 0;
    queued = false;
}

export function createDuskInternalScheduler(): PluginFunction {
    return app => {
        return {
            name: 'dusk-plugin-internal-scheduler',
            setup() {
                app.$scheduler = scheduler;
            },
        };
    };
}
