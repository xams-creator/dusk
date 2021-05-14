import 'reflect-metadata';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import EventEmitter from 'events';
import hoistStatics from 'hoist-non-react-statics';
import * as axios from 'axios';
import {applyMiddleware, combineReducers, compose, createStore, Middleware, ReducersMapObject, Store, StoreEnhancer} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';
import {
    BrowserHistoryBuildOptions, createBrowserHistory, createHashHistory, createMemoryHistory, HashHistoryBuildOptions, History,
} from 'history';
import {Provider} from 'react-redux';
import {Router, SwitchProps} from 'react-router-dom';
import {renderRoutes, RouteConfig, RouteConfigComponentProps} from 'react-router-config';

import {isEmpty, isFunction, looseEqual, noop, parseModelMethodKey, query, identity} from './util';
import DuskContext from './context/DuskContext';
import model from './index.model';
import DuskPluginManager, {APP_HOOKS_ON_LAUNCH, DuskPlugin, APP_HOOKS_ON_SUBSCRIBE, APP_HOOKS_ON_READY} from './plugin-manager';
import {AxiosInstance} from 'axios';

export {
    createHashHistory,
    createBrowserHistory,
    createMemoryHistory,
} from 'history';

export * from 'react-redux';
export * from 'redux';
export * from 'react-router-config';
export * from 'react-router-dom';


export {axios};
export {default as annotation} from './annotation';

export * from './util';
export * from './util/node-env';
export {EventEmitter} from 'events';
export {default as DuskContext} from './context/DuskContext';

// ============== constants ============== //
export const DUSK_APP = 'dusk.app';
export const DUSK_APPS = 'dusk.apps';
export const DUSK_APPS_MODELS = 'dusk.apps.@models';
export const DUSK_APPS_ROUTES = 'dusk.apps.@routes';
export const NAMESPACE = 'namespace';
export const INITIAL_DATA = 'initialData';
export const NAMESPACE_SEPARATOR = '/';
export const MODEL_TAG_GLOBAL = ':';
export const MODEL_TAG_SCOPED = '';

enum Mode {
    HASH = 'hash',
    BROWSER = 'browser',
    VIRTUAL = 'virtual'
}

// ============== constants ============== //

// ============== interface ============== //
type HistoryBuildOptions = BrowserHistoryBuildOptions | HashHistoryBuildOptions
type AppRoutesConfig = ((render) => Array<RouteConfig>) | Array<RouteConfig>
type AppModelsConfig = (() => Array<Model>) | Array<Model>
type AppReduxConfig = {
    middlewares?: Middleware[],
    enhancers?: StoreEnhancer[]
}


export interface AppOptions {
    [index: string]: any,

    history: {
        mode: 'hash' | 'browser' | 'virtual'    // router 模式
        options?: HistoryBuildOptions
    } | History
    axios?: axios.AxiosInstance
    routes?: AppRoutesConfig
    models?: AppModelsConfig
    redux?: AppReduxConfig

    suspense?: {        // 使用 lazy 方式加载组件时可以提供 suspense.fallback ，RouteView也有参数支持 suspense, 一个是全局，一个是局部
        fallback: NonNullable<React.ReactNode> | null
    }


    container?: Element | DocumentFragment | null | string,
    callback?: () => void
    render?: (props?: RouteConfigComponentProps) => React.ReactElement       //

    configuration?: {
        routes: boolean // 是否启用路由配置扫描，扫描到 configuration/routes 后自动注入到上下文
        axios: boolean
        history: boolean    // 1. optionsAxios > configurationAxios > defaultAxios
    }

}

export interface Model {
    namespace: string,
    state: object,
    readonly initialData?: object,
    reducers?: {    // 当define model 时，会处理 reducer name 的 ':' 到 global ,会拼接 namespace 到 scoped
        [index: string]: Function
    },
    reducer?: {}
    subscriptions?: {
        [index: string]: () => void
    },

    subscribe?: (oldValue, newValue, store, model) => void;

    scoped?: { // 当define model 时，不会处理 reducer name 的 ':' ,会拼接 namespace
        reducers: {
            [index: string]: Function
        },
        subscriptions?: {
            [index: string]: () => void
        },
    },
    global?: {  // 当define model 时，不会处理 reducer name 的 ':' ,也不会拼接 namespace
        reducers?: {
            [index: string]: Function
        },
        subscriptions?: {
            [index: string]: () => void
        },
    }
    // actions?: {
    //     [index: string]: Function
    // }
}

export interface IRouterView {
    routes: RouteConfig[] | undefined,
    extraProps?: any,
    switchProps?: SwitchProps,

    suspense?: {
        fallback: NonNullable<React.ReactNode> | null
    }

    test?: boolean
}

export interface DuskConfiguration {
    [index: string]: any

    experimental?: {
        context: boolean
    }
}

// ============== interface ============== //

// ============== components ============== //
export function RouterView({routes, extraProps, switchProps, suspense, test}: IRouterView) {
    return <React.Suspense
        fallback={suspense ? suspense.fallback : <React.Fragment/>}
        children={renderRoutes(routes, extraProps, switchProps)}
    />;
}

export const withDusk = (Component) => (props) => {
    // const displayName = `withDusk(${Component.displayName || Component.name})`;
    return (
        <DuskContext.Consumer>
            {context => {
                return <Component $app={context}{...props}/>;
            }}
        </DuskContext.Consumer>
    );
};

export function useAxios() {
    return React.useContext(DuskContext)._axios;
}

// ============== components ============== //
// function normalizationRouteConfig(route: RouteConfig) {
//
//
// }
//
// const processRoutes = (routes: RouteConfig[], parent: RouteConfig) => {
//     console.log(123);
//     const prefix = parent.path;
//     routes.forEach((route: RouteConfig) => {
//         if (route.routes) {
//             processRoutes(route.routes, route);
//         }
//     });
// };
// window.processRoutes = processRoutes;
const configuration: DuskConfiguration = {
    experimental: {
        context: false,
    },
};

export default class Dusk {

    protected readonly _options;
    _history: History;
    protected _routes: Array<RouteConfig>;
    protected _store: Store;
    _axios: axios.AxiosInstance;
    protected _contexts: {
        configuration: {}
    };
    private _models: {[index: string]: Model} = {};
    private _reducers: ReducersMapObject = {};
    private _listeners: {[index: string]: () => void} = {};
    _unListeners: {[index: string]: Function} = {};
    static configuration: DuskConfiguration;

    use(fn: () => DuskPlugin): Dusk {
        this.$pm.use(fn);
        return this;
    }

    private $pm: DuskPluginManager;

    $emitter;

    // _replace: boolean = false;

    constructor(options: AppOptions) {
        this._options = options;
        this.init(options);
    }

    init({history, models, routes, axios, redux}: AppOptions) {
        this.initContexts();
        this.initEventEmitter();
        this.initPluginManager();
        this.initAxios(axios);
        this.initHistory(history);
        this.initStore(models, redux);
        this.initRoutes(routes);
    }

    initContexts() {
        const contexts = this._contexts = {
            configuration: {
                'axios': null,
                'routes': null,
                'redux': null,
            },
        };
        if (configuration.experimental.context) {
            try {
                // @ts-ignore
                const modules = require.context(process.env.APP_PATH_CONFIGURATION, true);

                Object.keys(contexts.configuration).map((id) => {
                    contexts.configuration[id] = modules('./' + id).default;
                });
                // @ts-ignore
                // contexts.modules = require.context(process.env.APP_PATH_SRC, true, /\.*$/);
                this._contexts = contexts;
                // @ts-ignore
                // if (!process.env.SRC) {
                //     return () => {
                //         console.error('not implementation');
                //     };
                // }
                // @ts-ignore
                // /\/$|\.(tsx|jsx|js|ts|json)$/
                // /\.*$/
                // /^\.\/.*$/
                // /(?<!less|json)$/

                // @ts-ignore
                // const requireModule = require.context(process.env.APP_PATH_CONFIGURATION, true,);
                // console.log(requireModule.keys());
                // @ts-ignore
                // if (module.hot) {
                //     // @ts-ignore
                //     module.hot.accept(['../../xams-app-react/src/app', '../../xams-app-react/src/business/app1/'], () => {
                //         console.log('hello');
                //         this.startup();
                //     });
                // }
                // @ts-ignore
                // if (module.hot) {
                //     // @ts-ignore
                //     module.hot.accept(() => {
                //         this.startup();
                //     });
                // }
                // window.r = requireModule;
                // return requireModule;
            } catch (e) {

            }
        }
    }

    initEventEmitter() {
        this.$emitter = new EventEmitter();
    }

    initPluginManager() {
        this.$pm = new DuskPluginManager(this);
    }

    initAxios(customAxios: AxiosInstance) {
        this._axios = customAxios || this._contexts.configuration['axios'] || axios;
    }

    initHistory(history) {
        if (!history.mode) {
            this._history = history;
            return;
        }
        const {mode, options} = history;
        switch (mode) {
            case Mode.BROWSER:
                this._history = createBrowserHistory(options);
                break;
            case Mode.HASH:
                this._history = createHashHistory(options);
                break;
            default:
                break;
        }


    }

    initRoutes(routes: AppRoutesConfig) {
        const {render} = this._options;
        if (!routes) {
            routes = this._contexts.configuration['routes'];
        }
        if (isFunction(routes)) {
            // @ts-ignore
            routes = routes(render);
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
        models = isFunction(models) ? models() : models;
        const enhancers = [
            applyMiddleware(...[thunkMiddleware, createLogger()].concat(redux.middlewares || [])),
            ...(redux.enhancers || []),
        ];
        const store = this._store = createStore(identity, compose(...enhancers));
        this.initStoreReducers(models);
        store.replaceReducer(combineReducers(this._reducers));
        // this._replace = false;
    }

    initStoreReducers(models: Array<Model> = []) {
        models.unshift(model);
        models.concat(Reflect.getMetadata(DUSK_APPS_MODELS, Dusk)).forEach((model) => {
            this.define(model);
        });
        return this._reducers;
    }

    define(model: Model, options = {refresh: false, lazy: false}) {
        const {namespace, state: initialState, initialData, reducers, scoped, global} = model;
        const {reducers: srs, subscriptions: sbs} = scoped || {};
        const {reducers: grs, subscriptions: gbs} = (global || {});

        if (options.refresh) {
            delete this._models[namespace];
            delete this._reducers[namespace];
            this._unListeners[namespace]();
            delete this._listeners[namespace];
            delete this._unListeners[namespace];
        }
        Object.defineProperty(model, NAMESPACE, {
            writable: false,
            configurable: false,
        });
        Object.defineProperty(model, INITIAL_DATA, {
            writable: false,
            configurable: false,
        });

        const models = this._models;
        if (models[namespace]) {
            // console.error('重复的namespace或者reducers未提供');
            return;
        }

        const object = {
            scoped: {
                reducers: {...srs},
                subscriptions: {...sbs},
            },
            global: {
                reducers: {...grs},
                subscriptions: {...gbs},
            },
        };
        object.scoped.reducers && Object.keys(object.scoped.reducers).forEach((key) => {
            object.scoped.reducers[namespace + NAMESPACE_SEPARATOR + key] = object.scoped.reducers[key];
            delete object.scoped.reducers[key];
        });

        reducers && Object.keys(reducers).forEach((key) => {
            const {global, parsed} = parseModelMethodKey(key);
            const method = reducers[key];
            if (global) {
                object.global.reducers[parsed] = method;
            } else {
                object.scoped.reducers[namespace + NAMESPACE_SEPARATOR + key] = method;
            }
        });

        // Object.freeze(model.state);
        // const os = this._store.getState();
        this._reducers[namespace] = (state = initialState, {type, ...payload}) => {
            const method = object.global.reducers[type] || object.scoped.reducers[type];
            if (method) {
                return model.state = {...(method.apply(model, [state, Object.assign({}, initialData, payload)]))};
            }
            return state;
        };

        // delete model.reducers;
        // delete model.subscriptions;
        // delete model.reducer;
        models[namespace] = Object.assign({}, model, object);

        if (this._store) {
            this._store.replaceReducer(combineReducers(this._reducers));
        }

        const {$pm} = this;
        const it = this;

        function namespaceStateListener(store, namespace, compare = function(a, b) {
            return a == b;
        }) {
            let currentValue = store.getState()[namespace];
            return () => {
                let newValue = store.getState()[namespace];
                if (!compare(currentValue, newValue)) {
                    let oldValue = currentValue;
                    currentValue = newValue;
                    // console.log(`namespace: [${namespace}],`, `value:`, oldValue, ' => ', newValue);
                    $pm.apply(APP_HOOKS_ON_SUBSCRIBE, namespace, oldValue, newValue, store, model);
                    if (model.subscribe) {
                        model.subscribe.apply(it, [oldValue, newValue, store, model]);
                    }
                }
            };
        }

        this._listeners[namespace] = namespaceStateListener(this._store, namespace, looseEqual);
        this._unListeners[namespace] = this._store.subscribe(this._listeners[namespace]);
    }

    startup() {
        const {_history, _options: {container, suspense}, $pm} = this;
        $pm.start();
        $pm.apply(APP_HOOKS_ON_READY);

        ReactDOM.render(
            <Provider
                store={this._store}
                children={
                    <React.Suspense fallback={suspense ? suspense.fallback : <React.Fragment/>}>
                        <DuskContext.Provider value={this}>
                            <Router history={_history} children={<RouterView routes={this._routes}/>}/>
                        </DuskContext.Provider>
                    </React.Suspense>
                }
            />, query(container), this.callback.bind(this),
        );
    }

    callback() {
        this.$pm.apply(APP_HOOKS_ON_LAUNCH);
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
// interface Window {
//     [index: string]: any
// }
// declare var window: Window & typeof globalThis;
Reflect.defineMetadata(DUSK_APP, {}, Dusk);
Reflect.defineMetadata(DUSK_APPS, {}, Dusk);
Reflect.defineMetadata(DUSK_APPS_MODELS, [], Dusk);
Reflect.defineMetadata(DUSK_APPS_ROUTES, [], Dusk);



