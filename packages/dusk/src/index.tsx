import 'reflect-metadata';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import EventEmitter from 'events';
import * as axios from 'axios';
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
    APP_HOOKS_ON_LAUNCH,
    APP_HOOKS_ON_SUBSCRIBE,
    APP_HOOKS_ON_READY,
    APP_HOOKS_ON_ERROR,
    APP_HOOKS_ON_DOCUMENT_VISIBLE,
    APP_HOOKS_ON_DOCUMENT_HIDDEN,
    Plugin,
} from './plugin-manager';
import ModelManager, { Model } from './model-manager';
import { isNodeDevelopment } from './util/node-env';

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

// export * from 'axios';


export { default as annotation } from './annotation';

export * from './util';
export * from './util/node-env';
export { EventEmitter } from 'events';
export * from './context';

// ============== constants ============== //
export const DUSK_APP = 'dusk.app';
export const DUSK_APPS = 'dusk.apps';
export const DUSK_APPS_MODELS = 'dusk.apps.@models';
export const DUSK_APPS_ROUTES = 'dusk.apps.@routes';
export const NAMESPACE = 'namespace';
export const INITIAL_DATA = 'initialData';
export const NAMESPACE_SEPARATOR = '/';
export const DOT = '.';
export const MODEL_TAG_GLOBAL = ':';
export const MODEL_TAG_SCOPED = '';

enum Mode {
    HASH = 'hash',
    BROWSER = 'browser',
    VIRTUAL = 'virtual',
}


// ============== constants ============== //

// ============== interface & types ============== //
type HistoryBuildOptions = BrowserHistoryBuildOptions | HashHistoryBuildOptions;
export type AppRoutesConfig = ((render) => Array<RouteConfig>) | Array<RouteConfig>;
export type AppModelsConfig = (() => Array<Model>) | Array<Model>;
export type AppReduxConfig = {
    reducers?: ReducersMapObject;
    middlewares?: Middleware[];
    enhancers?: StoreEnhancer[];
};
export type IRouterView = {
    routes: RouteConfig[] | undefined;
    extraProps?: any;
    switchProps?: SwitchProps;

    suspense?: {
        fallback: NonNullable<React.ReactNode> | null;
    };
}

export interface AppOptions {
    [index: string]: any;

    history: {
        mode: 'hash' | 'browser' | 'virtual'; // router 模式
        options?: HistoryBuildOptions;
    } | History;
    axios?: axios.AxiosInstance;
    routes?: AppRoutesConfig;
    forceRenderRoutes?: (args: any) => React.ReactElement

    models?: AppModelsConfig;
    redux?: AppReduxConfig;

    suspense?: {
        // 使用 lazy 方式加载组件时可以提供 suspense.fallback ，RouteView也有参数支持 suspense, 一个是全局，一个是局部
        fallback: NonNullable<React.ReactNode> | null;
    };

    container?: Element | DocumentFragment | null | string;
    render?: (props?: RouteConfigComponentProps) => React.ReactElement; //
}

export interface DuskConfiguration {
    [index: string]: any;

    tips?: boolean
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
    tips: true,
    experimental: {
        context: false,
        caught: true,
    },
};


export default class Dusk {
    protected readonly _options;
    _history: History;
    protected _routes: Array<RouteConfig>;
    protected _store: Store;
    _axios: axios.AxiosInstance;
    protected _contexts: {
        configuration: {};
    };
    _listeners: { [index: string]: () => void } = {};
    _unListeners: { [index: string]: Function } = {};
    static configuration: DuskConfiguration;


    $pm: PluginManager;
    $mm: ModelManager;
    $emitter;
    $reducer = null;
    $started = false;

    constructor(options: AppOptions) {
        this._options = options;
        this.init(options);
    }

    init({ history, models, routes, axios, redux }: AppOptions) {
        this.initContexts();
        this.initEventEmitter();
        this.initModelManager();
        this.initPluginManager();
        this.initAxios(axios);
        this.initHistory(history);
        this.initStore(models, redux);
        this.initRoutes(routes);
        this.addEventListeners();
    }

    use(fn: () => Plugin): Dusk {
        this.$pm.use(fn);
        return this;
    }

    initContexts() {
        const contexts = this._contexts = {
            configuration: {
                axios: null,
                redux: null,
                routes: null,
            },
        };
        if (configuration.experimental.context) {
            // try {
            // @ts-ignore
            if (process.env.APP_PATH_CONFIGURATION) {
                //         // @ts-ignore
                //         // const req =  typeof __webpack_require__ === 'function' ? require : require
                //         // @ts-ignore
                //         // const requireFunc = typeof __webpack_require__ === 'function' ? require : require
                //
                //         // const modules = require.context(process.env.REACT_APP_PATH_CONFIGURATION || process.env.APP_PATH_CONFIGURATION, true);
                //         // Object.keys(contexts.configuration).map((id) => {
                //         //     contexts.configuration[id] = modules('./' + id).default;
                //         // });
                //         //     Object.keys(contexts.configuration).map(async (id) => {
                //         //         // @ts-ignore
                //         //         const module = await import(`${process.env.APP_PATH_CONFIGURATION}/${id}`);
                //         //         contexts.configuration[id] = module.default;
                //         //         console.log(contexts.configuration);
                //         //     });
                // @ts-ignore
                // const modules = require.context(process.env.APP_PATH_CONFIGURATION, true);
                Object.keys(contexts.configuration).map((id) => {
                    try {
                        // @ts-ignore
                        // const module = await import(`${process.env.APP_PATH_CONFIGURATION}/${id}`);
                        // contexts.configuration[id] = module.default;
                        // contexts.configuration[id] = modules('./' + id).default;
                        const module = require(`${process.env.APP_PATH_CONFIGURATION}/${id}`);
                        // @ts-ignore
                        // const module = require(`@/configuration/${id}`)
                        contexts.configuration[id] = module.default;
                    } catch (e) {
                        if (configuration.tips && isNodeDevelopment()) {
                            console.warn(e);
                        }
                    }
                });
            }
        }
    }

    initEventEmitter() {
        this.$emitter = new EventEmitter();
    }

    initModelManager() {
        this.$mm = new ModelManager(this);

        Object.defineProperty(this, '_models', {
            get() {
                return this.$mm.models;
            },
            set() {
                throw new Error('Do not replace the models.');
            },
        });
    }

    initPluginManager() {
        this.$pm = new PluginManager(this);
    }

    initAxios(customAxios: axios.AxiosInstance) {
        this._axios = customAxios || this._contexts.configuration['axios'] || axios.default;
    }

    initHistory(history) {
        if (!history.mode) {
            this._history = history;
            return;
        }
        const { mode, options } = history;
        switch (mode) {
            case Mode.HASH:
                this._history = createHashHistory(options);
                break;
            default:
                this._history = createBrowserHistory(options);
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
        this._routes = (routes as RouteConfig[]).concat(Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk));
    }

    initStore(models, redux: AppReduxConfig = this._contexts.configuration['redux'] || {}) {
        models = (isFunction(models) ? models() : models) || [];

        // define store
        const createEffectActionMiddleware = (ctx: Dusk) => store => next => action => {
            if (action && !isArray(action) && !isFunction(action)) { // fix 暂时不处理 redux-batch
                const { namespace, name, effect, payload } = convertReduxAction(action);
                if (effect) {
                    const model = ctx.$mm.get(namespace);
                    const action = model.actions[name];
                    if (action) {
                        // store.dispatch(async () => {
                        //     await action.apply(model, [store.getState()[namespace], payload, store, ctx]);
                        // });
                        next(async () => {
                            action.apply(model, [store.getState()[namespace], payload, store, ctx]);
                        });
                        // next(action.bind(model, store.getState()[namespace], payload, store, ctx));
                        // store.dispatch(async () => {
                        //     try {
                        //         await action.apply(model, [store.getState()[namespace], payload, store, ctx]);
                        //     } catch (e) {
                        //         console.log(e);
                        //     }
                        // });
                    }
                    return;
                }
            }
            return next(action);
        };
        // const monitorReducerEnhancer = createStore => (reducer, initialState, enhancer) => {
        //     const monitoredReducer = (state, action) => {
        //         const start = performance.now();
        //         const newState = (this.$reducer || identity)(state, action);
        //         const end = performance.now();
        //         console.log('reducer process time:');
        //         return newState;
        //     };
        //     return createStore(monitoredReducer, initialState, enhancer);
        // };
        const middlewares = [
            createEffectActionMiddleware(this),
            thunkMiddleware,
            createLogger(),
        ].concat(redux.middlewares || []);
        const middlewareEnhancer = applyMiddleware(...middlewares);
        const enhancers = [middlewareEnhancer, ...(redux.enhancers || [])];
        this._store = createStore(identity, {}, compose(...enhancers));
        // define models
        const defineModels = (models) => {
            models.unshift(model);
            models.concat(Reflect.getMetadata(DUSK_APPS_MODELS, Dusk)).forEach((model) => {
                this.define(model);
            });
        };
        defineModels(models);
        // define properties
        Object.defineProperty(this, 'state', {
            get() {
                return this._store.getState();
            },
            set() {
                throw new Error('Do not replace the stored state.');
            },
        });
    }

    define(model: Model, options: any = { replace: true, refresh: false, lazy: false, lock: true }) {
        const defineListener = (model) => {
            const it = this;
            const { _store, $pm } = this;
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

                        $pm.apply(APP_HOOKS_ON_SUBSCRIBE, namespace, oldValue, newValue, store, model);
                        if (model.subscribe) {
                            if (isNodeDevelopment()) {
                                console.log(`namespace: [${namespace}],`, `value:`, oldValue, ' => ', newValue);
                            }
                            model.subscribe.apply(it, [oldValue, newValue, store, model]);
                        }
                    }
                };
            }

            this._listeners[model.namespace] = namespaceStateListener(_store, model.namespace, looseEqual);
            this._unListeners[model.namespace] = _store.subscribe(this._listeners[model.namespace]);
        };

        this.$mm.define(model);
        defineListener(model);

        this.$reducer = combineReducers(this.$mm.reducers);
        options.replace && this._store.replaceReducer(this.$reducer);
    }


    addEventListeners() {
        const inBrowser = typeof window !== 'undefined';
        if (inBrowser) {
            const { addEventListener } = window;
            // 这个只能捕获到 in promise 的 error,event.type 可以区分错误类型
            const onError = event => {
                // 调用前 event.defaultPrevented === false ,调用后 event.defaultPrevented === true,是否可以做某事
                this.$pm.apply(APP_HOOKS_ON_ERROR, String(event.error?.message || event.reason?.message), event);
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
                this.$pm.apply(type, event);
            });
        }

    }

    startup() {
        const {
            _history,
            _options: { container, suspense },
            $pm,
            $started,
            _store,
            _routes,
        } = this;
        if (!$started) {
            $pm.start();
            $pm.apply(APP_HOOKS_ON_READY);
        }
        ReactDOM.render(
            <Provider
                store={_store}
                children={
                    <React.Suspense fallback={suspense ? suspense.fallback : <React.Fragment />}>
                        <DuskContext.Provider value={this}>
                            <Router history={_history} children={<RouterView routes={_routes} />} />
                        </DuskContext.Provider>
                    </React.Suspense>
                }
            />,
            query(container),
            () => {
                if (!$started) {
                    $pm.apply(APP_HOOKS_ON_LAUNCH);
                    this.$started = true;
                }
            },
        );
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
}

definePrototype();

declare global {
    interface Window {
        [index: string]: any;
    }
}
