import { isArray, isFunction, noop } from '../util';
import { isNodeDevelopment } from '../util/node-env';
import Dusk, { Model } from '../index';

export const APP_HOOKS_ON_READY = 'onReady';
export const APP_HOOKS_ON_LAUNCH = 'onLaunch';
export const APP_HOOKS_ON_SHOW = 'onShow';
export const APP_HOOKS_ON_HIDE = 'onHide';
export const APP_HOOKS_ON_SUBSCRIBE = 'onSubscribe';
export const APP_HOOKS_ON_ROUTE_BEFORE = 'onRouteBefore';
export const APP_HOOKS_ON_ROUTE_AFTER = 'onRouteAfter';

export const APP_HOOKS_ON_ERROR = 'onError';

const APP_PLUGIN_HOOKS = [
    APP_HOOKS_ON_READY,   // ReactDom.render 前触发
    APP_HOOKS_ON_LAUNCH, // ReactDom.render 后 callback 触发
    APP_HOOKS_ON_SHOW,  // 页面由不可见到可见触发 document.addEventListener("visibilitychange", handleVisibilityChange, false);
    APP_HOOKS_ON_HIDE,  // 页面由可见到不可见触发
    APP_HOOKS_ON_SUBSCRIBE, //
    APP_HOOKS_ON_ERROR,
    APP_HOOKS_ON_ROUTE_BEFORE,
    APP_HOOKS_ON_ROUTE_AFTER,
];

export interface PluginContext {
    readonly app: Dusk,

    [key: string]: any
}

export interface Plugin {
    name?: string
    order?: number  //
    onReady?: (ctx: PluginContext, next: Function) => void,
    onLaunch?: (ctx: PluginContext, next: Function) => void,
    onShow?: Function,
    onHide?: Function,
    onSubscribe?: (ctx: PluginContext, next: Function, namespace: string, oldValue: any, newValue: any, store, model: Model) => void
    onError?: (ctx: PluginContext, next: Function, msg: string, event: Event) => void,
    // [APP_HOOKS_ON_ROUTE_BEFORE]?: Function,
    // [APP_HOOKS_ON_ROUTE_AFTER]?: Function,
}

// export type PluginConfig = (() => Plugin) | Plugin

function compose(plugin) {
    if (!isArray(plugin)) {
        throw new TypeError('Middleware stack must be an array!');
    }
    for (const fn of plugin) {
        if (!isFunction(fn)) {
            throw new TypeError('Middleware must be composed of functions!');
        }
    }

    return function(context, next?, ...args) {
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

// class PluginNode {
//
//     value: null;
//     next: PluginNode;
//
//     constructor(value) {
//
//     }
//
//     add() {
//
//     }
// }


export default class PluginManager {

    ctx: Dusk;

    plugins: Function[];

    hooks: {
        [index: string]: Plugin[]
    };
    chain: {
        [index: string]: Function
    };

    constructor(ctx: Dusk) {
        this.ctx = ctx;
        this.init();
    }

    init() {
        this.plugins = [];
        this.hooks = {};
        this.chain = {};

        APP_PLUGIN_HOOKS.forEach((name) => {
            this.hooks[name] = [];
            this.chain[name] = noop;
        });
    }

    use(fn: () => Plugin) {
        if (!isFunction(fn)) {
            throw new TypeError('plugin must be a function!');
        }
        this.plugins.push(fn);
        const plugin: Plugin = fn.apply(this.ctx, this.ctx);
        if (plugin) {
            if (isNodeDevelopment()) {
                if (plugin.name) {
                    console.log({ plugin: plugin.name, enabled: true });
                }
            }
            APP_PLUGIN_HOOKS.forEach((name) => {
                const hook = plugin[name];
                if (isFunction(hook)) {
                    this.hooks[name].push(hook);
                }
            });
        }
    }

    start() {
        APP_PLUGIN_HOOKS.forEach((name) => {
            this.chain[name] = compose(this.hooks[name]);
            this.ctx.$emitter.on(name, this.chain[name]);
        });
    }

    apply(type, ...args) {
        this.ctx.$emitter.emit(type, createPluginContext(this.ctx), null, ...args);
    }

}

function createPluginContext(app): PluginContext {
    return { app };
}
