import 'reflect-metadata';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import EventEmitter from 'events';
import axios, { AxiosInstance, AxiosStatic } from 'axios';
import hotkeys from 'hotkeys-js';
import hoistStatics from 'hoist-non-react-statics';
import * as logger from './util/logger';

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
    History, MemoryHistoryBuildOptions,
} from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { RouteConfig, RouteConfigComponentProps } from 'react-router-config';

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
    PluginFactory, PluginBuilder,
} from './plugin-manager';
import {
    ComponentManager,
    ComponentProperties,
    createDuskInternalComponentManager,
    ModelManager,
    Model,
    createDuskInternalModelManager,
    createDuskInternalEvent,
    createDuskInternalHistory,
    createDuskInternalAxios,
    createDuskInternalContext,
    createDuskInternalRoutes,
    scheduler,
    createDuskInternalScheduler,
} from './plugins';
import { RouterView } from './components';
import { ReactNode } from 'react';

export * from './plugin-manager';
export * from './components';
export * from './plugins';

export {
    createHashHistory,
    createBrowserHistory,
    createMemoryHistory,
    createPath,
    createLocation,
    locationsAreEqual,
    parsePath,
} from 'history';

export { ReactDOM };
export * from 'react-redux';
export * from 'redux';
export * from 'react-router-config';
export * from 'react-router-dom';
export * from 'axios';
export { axios };
export { hotkeys };
export * from 'immer';
export * from './annotation';

export * from './util';
export * from './util/node-env';
export { logger };
export { EventEmitter } from 'events';
export * from './context';
export { hoistStatics } ;

// ============== constants ============== //
export const DUSK_APP = 'dusk.app';
export const DUSK_APPS = 'dusk.apps';
export const DUSK_APPS_MODELS = 'dusk.apps.@models';
export const DUSK_APPS_ROUTES = 'dusk.apps.@routes';
export const DUSK_APPS_ROUTES_CHILDREN = 'dusk.apps.@routes.@children';
export const DUSK_APPS_COMPONENTS = 'dusk.apps.@components';
export const NAMESPACE = 'namespace';
export const INITIAL_DATA = 'initialData';
export const NAMESPACE_SEPARATOR = '/';
export const DOT = '.';
export const MODEL_TAG_GLOBAL = ':';
export const MODEL_TAG_SCOPED = '';
// ============== constants ============== //

// ============== interface & types ============== //
type HistoryBuildOptions = BrowserHistoryBuildOptions | HashHistoryBuildOptions | MemoryHistoryBuildOptions;
export type AppRoutesConfig = ((render) => Array<RouteConfig>) | Array<RouteConfig>;
export type AppModelsConfig = (() => Array<Model>) | Array<Model>;
export type AppReduxConfig = Partial<{
    reducers: ReducersMapObject;
    middlewares: Middleware[];
    enhancers: StoreEnhancer[];
}>;

export type AppHistoryConfig = Partial<{
    mode: 'hash' | 'browser' | 'memory'// router 模式
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
        fallback: NonNullable<ReactNode> | null;
    };

    container: Element | DocumentFragment | null | string;
    render?: (props?: RouteConfigComponentProps) => React.ReactElement; //
}


export interface DuskConfiguration {
    [index: string]: any;

    plugin?: {
        hooks: string[] & Symbol[]
    };
    logger: {
        info?: (msg: string, ...args: any[]) => void
        warn?: (msg: string, ...args: any[]) => void
        error?: (msg: string, ...args: any[]) => void
    };
    silent: boolean; // 是否不打印log
    strict: boolean; // 严格模式下，model namespace 和 model actions effect 必须要正确，不严格模式下将自动修正 #TODO
    hmr: boolean;   // hmr启用标记，默认 false, 不需要设置，当使用 dusk-plugin-hmr 时 修改为 true。
    experimental?: {
        context: boolean;   // 自动加载一些组件，需要和 cli 配合
        caught?: boolean;   // true: 没处理就 preventDefault， false: 不处理
    };
    suspense: {
        fallback?: NonNullable<ReactNode> | null        // options.suspense.fallback > fallback > renderLoading
        renderLoading?: React.ReactElement
    };
}

export type Application = Dusk & IDusk;

// ============== interface ============== //

const configuration: DuskConfiguration = {
    plugin: {
        hooks: [],
    },
    logger: {},
    silent: true,
    strict: false,
    hmr: false,
    experimental: {
        context: true,
        caught: true,
    },
    suspense: {
        fallback: <React.Fragment />,
        renderLoading: <React.Fragment />,
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

    use(fn: PluginFactory): Dusk;

    component(options: ComponentProperties): Dusk;

    define(model: Model, options?): Dusk;

    route(route: RouteConfig): Dusk;

    emit(type, ...args): void;

    get state();

    get models();

    startup(): void;

}

@Reflect.metadata(DUSK_APP, {})
@Reflect.metadata(DUSK_APPS, {})
@Reflect.metadata(DUSK_APPS_MODELS, [])
@Reflect.metadata(DUSK_APPS_ROUTES, [])
@Reflect.metadata(DUSK_APPS_COMPONENTS, [])
export default class Dusk implements IDusk {
    $axios: AxiosInstance | AxiosStatic;
    $hotkeys: typeof hotkeys;
    $history: History;
    $store: Store;
    $logger: typeof logger;
    $scheduler: typeof scheduler;

    readonly _options: AppOptions;
    _routes: Array<RouteConfig>;

    [index: string]: any;

    _contexts: {
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
        this.emit = this.emit.bind(this);
        this._options = options;
        this.$hotkeys = hotkeys;
        this.$logger = logger;
        this._emitter = new EventEmitter();
        this._pm = new PluginManager(this);
        this.init(options);
    }

    emit(type: any, ...args: any[]): void {
        this._pm.apply(type, ...args);
    }

    static extensions(name, value: any) {
        this.prototype[`$${name}`] = value;
    }

    init({ history, models, routes, axios, redux }: AppOptions) {
        this
            .use(createDuskInternalContext())
            .use(createDuskInternalModelManager())
            .use(createDuskInternalAxios(axios))
            .use(createDuskInternalHistory(history))
            .use(createDuskInternalComponentManager())
            .use(createDuskInternalEvent())
            .use(createDuskInternalRoutes(routes))
            .use(createDuskInternalScheduler())
        ;
        this.initStore(models, redux);
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
            const { $store, emit } = this;
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

                        emit(APP_HOOKS_ON_SUBSCRIBE, namespace, oldValue, newValue, store, model);
                        if (model.subscribe) {
                            logger.info(`namespace: [${namespace}],`, `value:`, oldValue, ' => ', newValue);
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

        return this;
    }

    startup() {
        const {
            $history,
            $store,
            _options: { container, suspense },
            _pm,
            emit,
            _started,
            _routes,
        } = this;
        if (!_started) {
            _pm.start();
            emit(APP_HOOKS_ON_READY);
        }
        ReactDOM.render(
            <Provider
                store={$store}
                children={
                    <React.Suspense fallback={suspense?.fallback || Dusk.configuration.suspense.fallback}>
                        <DuskContext.Provider value={this}>
                            <Router history={$history} children={<RouterView routes={_routes} />} />
                        </DuskContext.Provider>
                    </React.Suspense>
                }
            />,
            query(container),
            () => {
                if (!_started) {
                    emit(APP_HOOKS_ON_LAUNCH);
                    this._started = true;
                }
            },
        );
    }

    route(route: RouteConfig) {
        this._routes.unshift(route);
        return this;
    }

    component(options: ComponentProperties) {
        this._cm.component(options);
        return this;
    }

    use(fn: PluginFactory) {
        this._pm.use(fn);
        return this;
    }

}

Object.defineProperty(Dusk, 'configuration', {
    get() {
        return configuration;
    },
    set() {
        throw new Error('Do not replace the Dusk.config object, set individual fields instead.');
    },
});

declare global {
    interface Window {
        [index: string]: any;
    }
}

// class C {
//     @Reflect.metadata(metadataKey, metadataValue)
//     method() {
//     }
// }
// Reflect.defineMetadata(metadataKey, metadataValue, C.prototype, "method");
