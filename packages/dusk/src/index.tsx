import 'reflect-metadata';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import EventEmitter from 'events';
import axios, { AxiosInstance } from 'axios';
import hotkeys from 'hotkeys-js';

import {
    applyMiddleware,
    combineReducers,
    compose,
    createStore,
    Middleware,
    ReducersMapObject,
    Store,
    StoreEnhancer,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import {
    BrowserHistoryBuildOptions,
    createBrowserHistory,
    createHashHistory,
    createMemoryHistory,
    HashHistoryBuildOptions,
    History,
} from 'history';
import { Provider } from 'react-redux';
import { Router, SwitchProps } from 'react-router-dom';
import { renderRoutes, RouteConfig, RouteConfigComponentProps } from 'react-router-config';

import { isEmpty, isFunction, looseEqual, identity, isArray } from './util';
import { query, convertReduxAction } from './util/internal';
import { DuskContext } from './context';
import model from './index.model';
import PluginManager, {
    APP_HOOKS_ON_READY,
    APP_HOOKS_ON_LAUNCH,
    APP_HOOKS_ON_SUBSCRIBE,
    APP_HOOKS_ON_ERROR,
    APP_HOOKS_ON_DOCUMENT_VISIBLE,
    APP_HOOKS_ON_DOCUMENT_HIDDEN,
    PluginFactory,
} from './plugin-manager';
import ModelManager, { Model } from './model-manager';
import ComponentManager, { ComponentProperties } from './component-manager';

export * from './plugin-manager';
export * from './model-manager';

export {
    createHashHistory,
    createBrowserHistory,
    createMemoryHistory,
    createPath,
    createLocation,
    locationsAreEqual,
    parsePath,
} from 'history';

export * from 'react-redux';
export * from 'redux';
export * from 'react-router-config';
export * from 'react-router-dom';
export { axios };
export { hotkeys };

export * from './annotation';

export * from './util';
export * from './util/node-env';
export { EventEmitter } from 'events';
export * from './context';

// ============== constants ============== //
export const DUSK_APP = 'dusk.app';
export const DUSK_APPS = 'dusk.apps';
export const DUSK_APPS_MODELS = 'dusk.apps.@models';
export const DUSK_APPS_ROUTES = 'dusk.apps.@routes';
export const DUSK_APPS_COMPONENTS = 'dusk.apps.@components';
export const NAMESPACE = 'namespace';
export const INITIAL_DATA = 'initialData';
export const NAMESPACE_SEPARATOR = '/';
export const DOT = '.';
export const MODEL_TAG_GLOBAL = ':';
export const MODEL_TAG_SCOPED = '';
// ============== constants ============== //

// ============== interface & types ============== //
type HistoryBuildOptions = BrowserHistoryBuildOptions | HashHistoryBuildOptions;
export type AppRoutesConfig = ((render) => Array<RouteConfig>) | Array<RouteConfig>;
export type AppModelsConfig = (() => Array<Model>) | Array<Model>;
export type AppReduxConfig = Partial<{
    reducers: ReducersMapObject;
    middlewares: Middleware[];
    enhancers: StoreEnhancer[];
}>;
export type IRouterView = {
    routes: RouteConfig[] | undefined;
    extraProps?: any;
    switchProps?: SwitchProps;

    suspense?: {
        fallback: NonNullable<React.ReactNode> | null;
    };
}
export type AppHistoryConfig = Partial<{
    mode: 'hash' | 'browser' | 'memory' | 'virtual'; // router 模式
    options: HistoryBuildOptions;
}> | History

export interface AppOptions {
    [index: string]: any;

    history?: AppHistoryConfig;
    axios?: AxiosInstance;
    routes?: AppRoutesConfig;
    forceRenderRoutes?: (args: any) => React.ReactElement;

    models?: AppModelsConfig;
    redux?: AppReduxConfig;

    suspense?: {
        // 使用 lazy 方式加载组件时可以提供 suspense.fallback ，RouteView也有参数支持 suspense, 一个是全局，一个是局部
        fallback: NonNullable<React.ReactNode> | null;
    };

    container: Element | DocumentFragment | null | string;
    render?: (props?: RouteConfigComponentProps) => React.ReactElement; //
}

export interface DuskConfiguration {
    [index: string]: any;

    plugin?: {
        hooks: string[] & Symbol[]
    };
    silent: boolean; // 是否不打印log
    strict: boolean; // 严格模式下，model namespace 和 model actions effect 必须要正确，不严格模式下将自动修正 #TODO
    hmr: boolean;   // hmr启用标记，默认 false, 不需要设置，当使用 dusk-plugin-hmr 时 修改为 true。
    experimental?: {
        context: boolean;   // 自动加载一些组件，需要和 cli 配合
        caught?: boolean;   // true: 没处理就 preventDefault， false: 不处理
    };
}

// ============== interface ============== //

// ============== components ============== //
export function RouterView({ routes, extraProps, switchProps, suspense }: IRouterView) {
    return (
        <React.Suspense
            fallback={suspense?.fallback || <React.Fragment />}
            children={renderRoutes(routes, extraProps, switchProps)}
        />
    );
}

const configuration: DuskConfiguration = {
    plugin: {
        hooks: [],
    },
    silent: true,
    strict: false,
    hmr: false,
    experimental: {
        context: true,
        caught: true,
    },
};

export interface IDusk {
    // $axios: AxiosInstance;
    // $hotkeys;
    // $history: History;
    // _store: Store;  // will Deprecated
    // $store: Store;
    //
    // _pm: PluginManager;
    // _mm: ModelManager;
    // _cm: ComponentManager;
    // _emitter: EventEmitter;
    // _reducer;
    // _started: boolean;

    use(fn: PluginFactory): void;

    component(options: ComponentProperties): void;

    define(model: Model, options): void;

    route(route: RouteConfig): void;

    get state();

    get models();
}


export default class Dusk implements IDusk {
    $axios: AxiosInstance;
    $hotkeys;
    $history: History;
    $store: Store;

    protected readonly _options: AppOptions;
    protected _routes: Array<RouteConfig>;

    [index: string]: any;

    protected _contexts: {
        configuration: {};
    };
    _listeners: { [index: string]: () => void } = {};
    _unListeners: { [index: string]: Function } = {};
    static configuration: DuskConfiguration;


    _pm: PluginManager;
    _mm: ModelManager;
    _cm: ComponentManager;
    _emitter: EventEmitter;
    _reducer = null;
    _started = false;

    get state() {
        return this.$store.getState();
    }

    get models() {
        return this._mm.models;
    }

    constructor(options: AppOptions) {
        this._options = options;
        this.$hotkeys = hotkeys;
        this._emitter = new EventEmitter();
        this.init(options);
    }


    static extensions(name, value: any) {
        this.prototype[`$${name}`] = value;
    }

    init({ history, models, routes, axios, redux }: AppOptions) {
        this.initContexts();
        this.initModelManager();
        this.initPluginManager();
        this.initComponentManager();
        this.initAxios(axios);
        this.initHistory(history);
        this.initStore(models, redux);
        this.initRoutes(routes);
        this.initComponents([]);
        this.addEventListeners();
    }

    use(fn: PluginFactory) {
        this._pm.use(fn);
    }

    initContexts() {
        const contexts = this._contexts = {
            configuration: {
                redux: null,
                routes: null,
            },
        };
        if (configuration.experimental.context) {
            // @ts-ignore
            let modules = require.context('@/business', true, /\.(tsx|ts|js|jsx)$/);
            modules.keys().forEach((key) => {
                modules(key);
            });
            // @ts-ignore
            if (process.env.APP_PATH_CONFIGURATION) {
                Object.keys(contexts.configuration).map((id) => {
                    try {
                        // const module = await import(`${process.env.APP_PATH_CONFIGURATION}/${id}`);
                        // contexts.configuration[id] = module.default;
                        // contexts.configuration[id] = modules('./' + id).default;
                        // const module = require(`${process.env.APP_PATH_CONFIGURATION}/${id}`);
                        // @ts-ignore
                        const module = require(`@/configuration/${id}`);
                        contexts.configuration[id] = module.default;
                    } catch (e) {
                        if (!Dusk.configuration.silent) {
                            console.warn(e);
                        }
                    }
                });
            }
        }
    }


    initModelManager() {
        this._mm = new ModelManager(this);
    }

    initPluginManager() {
        this._pm = new PluginManager(this);
    }

    initComponentManager() {
        this._cm = new ComponentManager(this);
    }

    component(options: ComponentProperties) {
        this._cm.component(options);
    }

    initComponents(cs: ComponentProperties[]) {
        const components: ComponentProperties[] = Reflect.getMetadata(DUSK_APPS_COMPONENTS, Dusk).concat(cs || []);
        components.forEach((component) => {
            this.component(component);
        });
    }

    initAxios(customAxios: AxiosInstance) {
        this.$axios = customAxios || axios; // todo 需要去解决 axios 通用性的问题  axios.create() axios instance 引入方式不同带来结果不同
    }

    initHistory(history) {
        if (history && !history.hasOwnProperty('mode')) {
            this.$history = history;
            return;
        }
        const { mode, options } = history || {};
        switch (mode) {
            case 'hash':
                this.$history = createHashHistory(options);
                break;
            case 'memory':
                this.$history = createMemoryHistory(options);
                break;
            default:
                this.$history = createBrowserHistory(options);
                break;
        }
    }

    initRoutes(routes: AppRoutesConfig) {
        const { render } = this._options;
        if (!routes) {
            routes = this._contexts.configuration['routes'];
        }
        if (isFunction(routes)) {
            routes = (routes as Function)(render);
        }
        if (isEmpty(routes)) {
            routes = [
                {
                    render: render,
                },
            ];
        }
        this._routes = Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk).concat((routes as RouteConfig[]));
    }

    initStore(models, redux: AppReduxConfig = this._contexts.configuration['redux'] || {}) {
        models = (isFunction(models) ? models() : models) || [];

        // define store
        const createEffectActionMiddleware = (ctx: Dusk) => store => next => action => {
            if (action && !isArray(action) && !isFunction(action)) { // fix 暂时不处理 redux-batch
                const { namespace, name, effect, payload } = convertReduxAction(action);
                if (effect) {
                    const model = ctx._mm.get(namespace);
                    const action = model.actions[name];
                    if (action) {
                        return next(() => {
                            // ctx._pm.apply()
                            // todo 增加几个帮助函数，比如 put delay
                            action.apply(model, [store.getState()[namespace], payload, store, ctx]);
                        });
                    }
                    return;
                }
            }
            return next(action);
        };
        const middlewares = [
            createEffectActionMiddleware(this),
            thunkMiddleware,
        ].concat(redux.middlewares || []);
        !Dusk.configuration.silent && middlewares.push(createLogger());

        const middlewareEnhancer = applyMiddleware(...middlewares);
        const enhancers = [middlewareEnhancer, ...[], ...(redux.enhancers || [])];
        this.$store = createStore(identity, {}, compose(...enhancers));
        // define models
        const defineModels = (models) => {
            models.unshift(model);
            models.concat(Reflect.getMetadata(DUSK_APPS_MODELS, Dusk)).forEach((model) => {
                this.define(model);
            });
        };
        defineModels(models);
    }

    define(model: Model, options: any = { replace: true, refresh: false, lazy: false, lock: true }) {
        const defineListener = (model) => {
            const it = this;
            const { $store, _pm } = this;
            if (this._listeners[model.namespace]) {
                return;
            }

            function namespaceStateListener(store, namespace, compare = function(a, b) {
                return a == b;
            }) {
                let currentValue = store.getState()[namespace];
                return () => {
                    let newValue = store.getState()[namespace];
                    if (!compare(currentValue, newValue)) {
                        let oldValue = currentValue;
                        currentValue = newValue;

                        _pm.apply(APP_HOOKS_ON_SUBSCRIBE, namespace, oldValue, newValue, store, model);
                        if (model.subscribe) {
                            if (!configuration.silent) {
                                console.log(`namespace: [${namespace}],`, `value:`, oldValue, ' => ', newValue);
                            }
                            model.subscribe.apply(it, [oldValue, newValue, store, model]);
                        }
                    }
                };
            }

            this._listeners[model.namespace] = namespaceStateListener($store, model.namespace, looseEqual);
            this._unListeners[model.namespace] = $store.subscribe(this._listeners[model.namespace]);
        };

        this._mm.define(model);
        defineListener(model);

        this._reducer = combineReducers(this._mm.reducers);
        options.replace && this.$store.replaceReducer(this._reducer);
    }


    private addEventListeners() {
        const inBrowser = typeof window !== 'undefined';
        if (inBrowser) {
            const { addEventListener } = window;
            // 这个只能捕获到 in promise 的 error,event.type 可以区分错误类型
            const onError = event => {  // todo fix 当直接 throw new Error 时,react-dom 会进行一次 rethrow ，导致2次onError
                // 调用前 event.defaultPrevented === false ,调用后 event.defaultPrevented === true,是否可以做某事
                this._pm.apply(APP_HOOKS_ON_ERROR, String(event.error?.message || event.reason?.message), event);
                if (configuration.experimental.caught) {
                    if (!event.defaultPrevented) {
                        event.preventDefault();
                    }
                }
            };
            addEventListener('unhandledrejection', onError);
            addEventListener('error', onError);
            addEventListener('visibilitychange', (event) => {
                const { visibilityState } = document;
                const type = visibilityState === 'visible' ? APP_HOOKS_ON_DOCUMENT_VISIBLE : APP_HOOKS_ON_DOCUMENT_HIDDEN;
                this._pm.apply(type, event);
            });
        }
    }

    startup() {
        const {
            $history,
            $store,
            _options: { container, suspense },
            _pm,
            _started,
            _routes,
        } = this;
        if (!_started) {
            _pm.start();
            _pm.apply(APP_HOOKS_ON_READY);
        }
        ReactDOM.render(
            <Provider
                store={$store}
                children={
                    <React.Suspense fallback={suspense ? suspense.fallback : <React.Fragment />}>
                        <DuskContext.Provider value={this}>
                            <Router history={$history} children={<RouterView routes={_routes} />} />
                        </DuskContext.Provider>
                    </React.Suspense>
                }
            />,
            query(container),
            () => {
                if (!_started) {
                    _pm.apply(APP_HOOKS_ON_LAUNCH);
                    this._started = true;
                }
            },
        );
    }

    route(route: RouteConfig): void {
        this._routes.unshift(route);
    }

}

function definePrototype() {
    Object.defineProperty(Dusk, 'configuration', {
        get() {
            return configuration;
        },
        set() {
            throw new Error('Do not replace the Dusk.config object, set individual fields instead.');
        },
    });
    Reflect.defineMetadata(DUSK_APP, {}, Dusk);
    Reflect.defineMetadata(DUSK_APPS, {}, Dusk);
    Reflect.defineMetadata(DUSK_APPS_MODELS, [], Dusk);
    Reflect.defineMetadata(DUSK_APPS_ROUTES, [], Dusk);
    Reflect.defineMetadata(DUSK_APPS_COMPONENTS, [], Dusk);
}

definePrototype();

declare global {
    interface Window {
        [index: string]: any;
    }
}
