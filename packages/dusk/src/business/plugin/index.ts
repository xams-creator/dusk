import { isArray, isFunction, noop } from '../../common';
import Dusk from '../../index';
import { createPluginHookContext } from './context';
import AbstractManager from '../manager';
import EventEmitter from 'events';
import {
    APP_PLUGIN_HOOKS,
} from './common';
import { Plugin, PluginExtraHooks, PluginFunction, PluginOnceHooks, PluginHookContext } from './types';


function compose(plugin) {
    if (!isArray(plugin)) {
        throw new TypeError('Middleware stack must be an array!');
    }
    for (const fn of plugin) {
        if (!isFunction(fn)) {
            throw new TypeError('Middleware must be composed of functions!');
        }
    }

    return function(context: PluginHookContext, next: Function, ...args) {
        let index = -1;
        return dispatch(0);

        function dispatch(i) {
            if (i <= index) {
                return Promise.reject(new Error('next() called multiple times'));
            }
            index = i;
            let fn = plugin[i];
            if (i === plugin.length) {
                fn = next;
            }
            if (!fn) {
                return Promise.resolve();
            }
            try {
                return Promise.resolve(fn(context, dispatch.bind(null, i + 1), ...args));
            } catch (err) {
                return Promise.reject(err);
            }
        }
    };
}

export class PluginManager extends AbstractManager<PluginFunction> {

    plugins: Plugin[];

    hooks: {
        [index: string]: Plugin[]
    };
    chain: {
        [index: string]: Function
    };

    names: string[];

    emitter: EventEmitter;

    initialization() {
        this.emitter = new EventEmitter();
        this.plugins = [];
        this.hooks = {};
        this.chain = {};
        this.names = Array.from(new Set(APP_PLUGIN_HOOKS.concat(Dusk.configuration.plugin.hooks)));
        this.names.forEach((name) => {
            // const symbol = typeof key === 'symbol';
            // const name = symbol ? Symbol.keyFor(key) : key;
            this.hooks[name] = [];
            this.chain[name] = noop;
        });
    }

    use(fn: PluginFunction) {
        if (!isFunction(fn)) {
            throw new TypeError('plugin must be a function!');
        }
        const plugin: Plugin & PluginExtraHooks & PluginOnceHooks = fn.apply(null, [this.ctx]);
        if (plugin) {
            this.plugins.push(plugin);
            plugin.setup?.(this.ctx);
            this.ctx.$logger.info('use plugin', plugin);
            this.names.forEach((name) => {
                const hook = plugin[name];
                if (isFunction(hook)) {
                    this.hooks[name].push(hook);
                }
            });
        }
    }

    start() {
        this.names.forEach((name) => {
            this.chain[name] = compose(this.hooks[name]);
            this.emitter.on(name, this.chain[name]);
        });
    }

    apply(type, ...args) {
        const context = createPluginHookContext(this.ctx, type, ...args);
        this.emitter.emit(type, context, null, ...args);
    }

    dispose(): void {
        this.chain = {};
        this.emitter.removeAllListeners();
    }

}
