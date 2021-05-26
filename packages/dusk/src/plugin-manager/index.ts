import {isArray, isFunction, noop} from '../util';
import Dusk, {isNodeDevelopment} from '../index';

export const APP_HOOKS_ON_READY = 'onReady';
export const APP_HOOKS_ON_LAUNCH = 'onLaunch';
export const APP_HOOKS_ON_SHOW = 'onShow';
export const APP_HOOKS_ON_HIDE = 'onHide';
export const APP_HOOKS_ON_SUBSCRIBE = 'onSubscribe';
export const APP_HOOKS_ON_ROUTE_BEFORE = 'onRouteBefore';
export const APP_HOOKS_ON_ROUTE_AFTER = 'onRouteAfter';

export const APP_HOOKS_ON_ERROR = 'onError';

const APP_PLUGIN_HOOKS = [
    APP_HOOKS_ON_READY,   // app init 结束时触发
    APP_HOOKS_ON_LAUNCH, // ReactDom.render 触发 callback 时
    APP_HOOKS_ON_SHOW,  // document.addEventListener("visibilitychange", handleVisibilityChange, false);
    APP_HOOKS_ON_HIDE,
    APP_HOOKS_ON_SUBSCRIBE,
    APP_HOOKS_ON_ERROR,
    APP_HOOKS_ON_ROUTE_BEFORE,
    APP_HOOKS_ON_ROUTE_AFTER,
];

export interface DuskPlugin {
    name?: string
    order?: number  //
    [APP_HOOKS_ON_READY]?: Function,
    [APP_HOOKS_ON_LAUNCH]?: Function,
    [APP_HOOKS_ON_SHOW]?: Function,
    [APP_HOOKS_ON_HIDE]?: Function,
    [APP_HOOKS_ON_SUBSCRIBE]?: Function,
    [APP_HOOKS_ON_ERROR]?: Function,
    [APP_HOOKS_ON_ROUTE_BEFORE]?: Function,
    [APP_HOOKS_ON_ROUTE_AFTER]?: Function,
}

// export type DuskPluginConfig = (() => DuskPlugin) | DuskPlugin

function compose(plugin) {
    if (!isArray(plugin)) {
        throw new TypeError('Middleware stack must be an array!');
    }
    for (const fn of plugin) {
        if (typeof fn !== 'function') {
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


export default class DuskPluginManager {

    app: Dusk;

    plugins: Function[];

    hooks: {
        [index: string]: DuskPlugin[]
    };
    chain: {
        [index: string]: Function
    };

    constructor(app: Dusk) {
        this.app = app;
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

    use(fn: () => DuskPlugin) {
        if (!isFunction(fn)) {
            throw new TypeError('plugin must be a function!');
        }
        this.plugins.push(fn);
        const model: DuskPlugin = fn.apply(this.app, this.app);
        if (model) {
            if (isNodeDevelopment()) {
                if (model.name) {
                    console.log({plugin: model.name, enabled: true});
                }
            }
            APP_PLUGIN_HOOKS.forEach((name) => {
                const hook = model[name];
                if (isFunction(hook)) {
                    this.hooks[name].push(hook);
                }
            });
        }
    }

    start() {
        APP_PLUGIN_HOOKS.forEach((name) => {
            this.chain[name] = compose(this.hooks[name]);
            this.app.$emitter.on(name, this.chain[name]);
        });
    }

    apply(type, ...args) {
        this.app.$emitter.emit(type, this.app, null, ...args);
    }

}
