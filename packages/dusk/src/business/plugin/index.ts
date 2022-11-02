import { isArray, isFunction, noop } from '../../common';
import Dusk, { DuskApplication, logger } from '../../index';
import { createPluginHookContext, PluginHookContext } from './context';

export const APP_HOOKS_ON_READY = 'onReady';
export const APP_HOOKS_ON_LAUNCH = 'onLaunch';
export const APP_HOOKS_ON_DESTROY = 'onDestroy';


export const APP_HOOKS_ON_DOCUMENT_VISIBLE = 'onDocumentVisible';
export const APP_HOOKS_ON_DOCUMENT_HIDDEN = 'onDocumentHidden';
export const APP_HOOKS_ON_SUBSCRIBE = 'onSubscribe';
export const APP_HOOKS_ON_ROUTE_BEFORE = 'onRouteBefore';
export const APP_HOOKS_ON_ROUTE_AFTER = 'onRouteAfter';

export const APP_HOOKS_ON_ERROR = 'onError';

export const APP_HOOKS_ON_PRE_ACTION = 'onPreAction';
export const APP_HOOKS_ON_POST_ACTION_AFTER = 'onPostAction';


const APP_PLUGIN_HOOKS = [
    APP_HOOKS_ON_READY,   // ReactDom.render 前触发
    APP_HOOKS_ON_LAUNCH, // ReactDom.render 后 callback 触发
    APP_HOOKS_ON_DESTROY, // 销毁时触发
    APP_HOOKS_ON_DOCUMENT_VISIBLE,  // 页面由不可见到可见触发 document.addEventListener("visibilitychange", handleVisibilityChange, false);
    APP_HOOKS_ON_DOCUMENT_HIDDEN,  // 页面由可见到不可见触发 这里有 pageshow 和 pagehide ，参考mdn，发现不推荐用
    APP_HOOKS_ON_SUBSCRIBE, // 当state发生改变时执行
    APP_HOOKS_ON_ERROR, // 当 uncaught error 时执行
    APP_HOOKS_ON_ROUTE_BEFORE,
    APP_HOOKS_ON_ROUTE_AFTER,
    APP_HOOKS_ON_PRE_ACTION,
    APP_HOOKS_ON_POST_ACTION_AFTER,
];


export type PluginFunction = (app: DuskApplication) => Plugin & PluginExtraHooks & PluginOnceHooks;
export type PluginFactory = PluginFunction;

export interface PluginExtraHooks {

}

export interface Plugin {
    name?: string
    setup?: (app: DuskApplication) => void  // fn.apply后的事件，0.22前写在plugin对象外面，现在增加一个函数统一放置
    order?: number  // 未实现，使用order从语义上看是否会带来混乱? app.use(1) app.use(2) 可能2先执行的问题
    onReady?: (ctx: PluginHookContext, next: () => void) => void,
    onLaunch?: (ctx: PluginHookContext, next: Function) => void,
    onDestroy?: (ctx: PluginHookContext, next: Function) => void,
    onDocumentVisible?: (ctx: PluginHookContext, next: Function, event: Event) => void,
    onDocumentHidden?: (ctx: PluginHookContext, next: Function, event: Event) => void,
    // onSubscribe?: (ctx: PluginContext, next: Function, namespace: string, oldValue: any, newValue: any, store, model: Model) => void
    onError?: (ctx: PluginHookContext, next: Function, msg: string, event: Event) => void,
    // [APP_HOOKS_ON_ROUTE_BEFORE]?: Function,
    // [APP_HOOKS_ON_ROUTE_AFTER]?: Function,
    [extraHooks: string]: any
}

export interface PluginOnceHooks {
    onceReady?: (ctx: PluginHookContext, next: Function) => void,
    onceLaunch?: (ctx: PluginHookContext, next: Function) => void,
    onceDocumentVisible?: (ctx: PluginHookContext, next: Function, event: Event) => void,
    onceDocumentHidden?: (ctx: PluginHookContext, next: Function, event: Event) => void,
    onceError?: (ctx: PluginHookContext, next: Function, msg: string, event: Event) => void,
}

export class PluginBuilder {

    private plugin: Plugin = {};

    name(name) {
        this.plugin.name = name;
        return this;
    }

    setup(fn: (app: DuskApplication) => void) {
        this.plugin.setup = fn;
        return this;
    }

    hook(name: string, fn: any) {
        this.plugin[name] = fn;
        return this;
    }

    build(): PluginFactory {
        return (app: DuskApplication) => {
            return this.plugin;
        };
    }

}

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

export class PluginManager {

    ctx: DuskApplication;

    plugins: Plugin[];

    hooks: {
        [index: string]: Plugin[]
    };
    chain: {
        [index: string]: Function
    };

    names: string[];

    constructor(ctx: DuskApplication) {
        this.ctx = ctx;
        this.init();
    }


    init() {
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
            plugin.setup && plugin.setup.apply(null, [this.ctx]);
            logger.info('use plugin', plugin);
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
            this.ctx._emitter.on(name, this.chain[name]);
        });
    }

    apply(type, ...args) {
        const context = createPluginHookContext(this.ctx, type, ...args);
        this.ctx._emitter.emit(type, context, null, ...args);
    }

}

