import 'reflect-metadata';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import EventEmitter from 'events';
import hoistStatics from 'hoist-non-react-statics';
import * as axios from 'axios';
import {
    applyMiddleware, bindActionCreators,
    combineReducers,
    compose,
    createStore,
    Middleware,
    ReducersMapObject,
    Store,
    StoreEnhancer,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';
import {
    BrowserHistoryBuildOptions,
    createBrowserHistory,
    createHashHistory,
    createMemoryHistory,
    HashHistoryBuildOptions,
    History,
} from 'history';
import {Provider} from 'react-redux';
import {Router, SwitchProps} from 'react-router-dom';
import {renderRoutes, RouteConfig, RouteConfigComponentProps} from 'react-router-config';

import {isEmpty, isFunction, looseEqual, noop, query, identity} from './util';
import DuskContext from './context/DuskContext';
import model from './index.model';
import DuskPluginManager, {
    APP_HOOKS_ON_LAUNCH,
    DuskPlugin,
    APP_HOOKS_ON_SUBSCRIBE,
    APP_HOOKS_ON_READY,
    APP_HOOKS_ON_ROUTE_BEFORE,
    APP_HOOKS_ON_ROUTE_AFTER,
} from './plugin-manager';
import {isNodeDevelopment} from './util/node-env';

export {createHashHistory, createBrowserHistory, createMemoryHistory} from 'history';

export * from 'react-redux';
export * from 'redux';
export * from 'react-router-config';
export * from 'react-router-dom';
export {axios};

// export * from 'axios';


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
    VIRTUAL = 'virtual',
}

// ============== constants ============== //

// ============== interface ============== //
type HistoryBuildOptions = BrowserHistoryBuildOptions | HashHistoryBuildOptions;
type AppRoutesConfig = ((render) => Array<RouteConfig>) | Array<RouteConfig>;
type AppModelsConfig = (() => Array<Model>) | Array<Model>;
type AppReduxConfig = {
    reducers?: ReducersMapObject;
    middlewares?: Middleware[];
    enhancers?: StoreEnhancer[];
};

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
    callback?: () => void;
    render?: (props?: RouteConfigComponentProps) => React.ReactElement; //

    configuration?: {
        routes: boolean; // 是否启用路由配置扫描，扫描到 configuration/routes 后自动注入到上下文
        axios: boolean;
        history: boolean; // 1. optionsAxios > configurationAxios > defaultAxios
    };
}

export interface Model {
    namespace: string;
    state: object;
    readonly initialData?: object;
    reducers?: {
        // 当define model 时，会处理 reducer name 的 ':' 到 global ,会拼接 namespace 到 scoped
        [index: string]: Function;
    };
    reducer?: {};
    subscriptions?: {
        [index: string]: () => void;
    };

    subscribe?: (oldValue, newValue, store, model) => void;

    scoped?: {
        // 当define model 时，不会处理 reducer name 的 ':' ,会拼接 namespace
        reducers?: {
            [index: string]: Function;
        };
        subscriptions?: {
            [index: string]: () => void;
        };
        // actions?: {
        //     [index: string]: Function
        // }
    };
    global?: {
        // 当define model 时，不会处理 reducer name 的 ':' ,也不会拼接 namespace
        reducers?: {
            [index: string]: Function;
        };
        subscriptions?: {
            [index: string]: () => void;
        };
        // actions?: {
        //     [index: string]: Function
        // }
    };
    actions?: {
        [index: string]: Function
    }
}

export interface IRouterView {
    routes: RouteConfig[] | undefined;
    extraProps?: any;
    switchProps?: SwitchProps;

    suspense?: {
        fallback: NonNullable<React.ReactNode> | null;
    };

    test?: boolean;
}

export interface DuskConfiguration {
    [index: string]: any;

    // tips?: boolean
    experimental?: {
        context: boolean;
        effect?: boolean
    };
}

// ============== interface ============== //

// ============== components ============== //
export function RouterView({routes, extraProps, switchProps, suspense, test}: IRouterView) {
    return (
        <React.Suspense
            fallback={suspense ? suspense.fallback : <React.Fragment/>}
            children={renderRoutes(routes, extraProps, switchProps)}
        />
    );
}

export const withDusk = (Component) => (props) => {
    // const displayName = `withDusk(${Component.displayName || Component.name})`;
    return (
        <DuskContext.Consumer>
            {(context) => {
                return <Component $app={context} {...props} />;
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
            effect: true,  // 默认为middleware的
        },
    }
;

export default class Dusk {
    protected readonly _options;
    _history: History;
    protected _routes: Array<RouteConfig>;
    protected _store: Store;
    _axios: axios.AxiosInstance;
    protected _contexts: {
        configuration: {};
    };
    private _models: {[index: string]: Model} = {};
    private _reducers: ReducersMapObject = {};
    private _actions: {} = {};
    private _listeners: {[index: string]: () => void} = {};
    _unListeners: {[index: string]: Function} = {};
    static configuration: DuskConfiguration;


    private $pm: DuskPluginManager;

    $emitter;

    __ENABLE_MODEL_REPLACE__: boolean = false;

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

        Object.defineProperty(this, 'state', {
            get() {
                return this._store.getState();
            },
            set() {
                throw new Error('Do not replace the stored state.');
            },
        });

        // const routeListener = (location, action) => {
        //     console.log(action, location);
        // };
        // this._history.listen((...args) => {
        //     this.$pm.apply(APP_HOOKS_ON_ROUTE_BEFORE,...args);
        //     routeListener(...args);
        //     this.$pm.apply(APP_HOOKS_ON_ROUTE_AFTER,...args);
        // });
        // Function.prototype.before = function(beforefn){
        //     var _self = this;
        //     return function(){
        //         if(beforefn.apply(this,arguments) === false){
        //             return false;
        //         }
        //         return _self.apply(this,arguments);
        //     }
        // }
        // Function.prototype.after = function(afterfn){
        //     var _self = this;
        //     return function(){
        //         var ret = _self.apply(this,arguments);
        //         if(ret === false){
        //             return false;
        //         }
        //         afterfn.apply(this,arguments);
        //         return ret;
        //     }
        // }

    }

    use(fn: () => DuskPlugin): Dusk {
        this.$pm.use(fn);
        return this;
    }

    initContexts() {
        const contexts = (this._contexts = {
            configuration: {
                axios: null,
                routes: null,
                redux: null,
            },
        });
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

    initAxios(customAxios: axios.AxiosInstance) {
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
        models = isFunction(models) ? models() : models;

        const it = this;

        function createEffectActionMiddleware(extraArgument?) {
            return function(store) {
                return function(next) {
                    return function(action) {
                        const {type, effect, ...payload} = action;
                        if (effect) {
                            const namespace = type.substring(0, type.lastIndexOf(NAMESPACE_SEPARATOR));
                            // 除非这里能获取到 namespace，否则不容易确定一个model
                            // 这里或许需要循环来执行global actions
                            const model = it._models[namespace];
                            const action = model.actions[type];
                            // const action = model.global.actions[type] || model.scoped.actions[type];
                            if (action) {
                                store.dispatch(() => {
                                    action.apply(model, [store.getState()[namespace], Object.assign({}, payload), store, it]);
                                });
                            }
                            return null;
                        }
                        return next(action);
                    };
                };
            };
        }

        const enhancers = [
            applyMiddleware(...[
                thunkMiddleware,
                createLogger(),
                configuration.experimental.effect && createEffectActionMiddleware(),
            ].filter(Boolean).concat(redux.middlewares || [])),
            ...(redux.enhancers || []),
        ];
        const store = (this._store = createStore(identity, {}, compose(...enhancers)));
        this.initStoreReducers(models);
        store.replaceReducer(combineReducers({...this._reducers, ...this._actions}));
        this.__ENABLE_MODEL_REPLACE__ = true;
    }

    initStoreReducers(models: Array<Model> = []) {
        models.unshift(model);
        models.concat(Reflect.getMetadata(DUSK_APPS_MODELS, Dusk)).forEach((model) => {
            this.define(model);
        });
    }

    define(model: Model, options = {refresh: false, lazy: false, lock: true}) {
        initialization(model);

        function initialization(model: Model) {
            if (model.namespace[model.namespace.length - 1] === NAMESPACE_SEPARATOR) {
                model.namespace = model.namespace.substring(0, model.namespace.lastIndexOf(NAMESPACE_SEPARATOR));
            }
            model.actions = model.actions || {};
            model.scoped = model.scoped || {};
            model.global = model.global || {};
        }

        const {state: initialState, initialData, reducers, scoped, global, actions, namespace} = model;

        const {reducers: srs, subscriptions: sbs} = scoped || {};
        const {reducers: grs, subscriptions: gbs} = global || {};
        const {_unListeners, _models, _reducers, _listeners, $pm} = this;


        function refresh() {
            _unListeners[namespace]();
            delete _models[namespace];
            delete _reducers[namespace];
            delete _listeners[namespace];
            delete _unListeners[namespace];
        }

        function lockModel() {
            Object.defineProperty(model, NAMESPACE, {
                writable: false,
                configurable: false,
            });
            Object.defineProperty(model, INITIAL_DATA, {
                writable: false,
                configurable: false,
            });
        }

        function parseModelMethodKey(key) {
            return {
                origin: key,
                parsed: key && key.replace(MODEL_TAG_GLOBAL, MODEL_TAG_SCOPED),
                global: key && key.indexOf(MODEL_TAG_GLOBAL) === 0,
            };
        }
        // function validate() {
        //     return true;
        // }
        // if (!validate()) {
        //     return;
        // }
        options.refresh && refresh();
        options.lock && lockModel();


        const models = this._models;
        if (models[namespace]) {
            return;
        }

        const object = {
            scoped: {
                reducers: {...srs},
                subscriptions: {...sbs},
                // actions: sas ? {...sas} : {},
            },
            global: {
                reducers: {...grs},
                subscriptions: {...gbs},
                // actions: gas ? {...gas} : {},
            },
        };
        object.scoped.reducers &&
        Object.keys(object.scoped.reducers).forEach((key) => {
            object.scoped.reducers[namespace + NAMESPACE_SEPARATOR + key] = object.scoped.reducers[key];
            delete object.scoped.reducers[key];
        });

        reducers &&
        Object.keys(reducers).forEach((key) => {
            const {global, parsed} = parseModelMethodKey(key);
            const method = reducers[key];
            if (global) {
                object.global.reducers[parsed] = method;
            } else {
                object.scoped.reducers[namespace + NAMESPACE_SEPARATOR + key] = method;
            }
        });

        // object.scoped.actions &&
        // Object.keys(object.scoped.actions).forEach((key) => {
        //     object.scoped.actions[namespace + NAMESPACE_SEPARATOR + key] = object.scoped.actions[key];
        //     delete object.scoped.actions[key];
        // });
        // @ts-ignore
        // object.scoped._actions = object.scoped.actions;
        // @ts-ignore
        // object.scoped.actions = bindActionCreators(object.scoped.actions || {}, this._store.dispatch);

        // Object.freeze(model.state);
        // const os = this._store.getState();

        this._reducers[namespace] = (state = initialState, {type, effect, ...payload}) => {
            if (effect && !configuration.experimental.effect) {
                // const action = object.global.actions[type] || object.scoped.actions[type];  // todo 先禁用global的actions处理
                const action = model.actions[type];
                if (action) {
                    const dispatch: (Function) => {} = this._store.dispatch;
                    dispatch((dispatch, getState) => {
                        // getState();   // todo remark : 由于 reducer执行中无法getState(),所以得想办法拿当前的state tree
                        action.apply(model, [state, Object.assign({}, payload), {dispatch}, this]);
                    });
                    return state;
                }
                return state;
            }
            const method = object.global.reducers[type] || object.scoped.reducers[type];
            if (method) {
                return (model.state = {...method.apply(model, [state, Object.assign({}, initialData, payload)])});
            }
            return state;
        };

        // delete model.reducers;
        // delete model.subscriptions;
        // delete model.reducer;
        models[namespace] = Object.assign({}, model, object);

        const it = this;

        function namespaceStateListener(
            store,
            namespace,
            compare = function(a, b) {
                return a == b;
            },
        ) {
            let currentValue = store.getState()[namespace];
            return () => {
                let newValue = store.getState()[namespace];
                if (!compare(currentValue, newValue)) {
                    let oldValue = currentValue;
                    currentValue = newValue;

                    if (isNodeDevelopment()) {
                        console.log(`namespace: [${namespace}],`, `value:`, oldValue, ' => ', newValue);
                    }
                    $pm.apply(APP_HOOKS_ON_SUBSCRIBE, namespace, oldValue, newValue, store, model);
                    if (model.subscribe) {
                        model.subscribe.apply(it, [oldValue, newValue, store, model]);
                    }
                }
            };
        }

        // if (this._store && this.__ENABLE_MODEL_REPLACE__) {
        //     this._store.replaceReducer(combineReducers({...this._reducers, ...this._actions}));
        // }
        if (this._store) {
            this._store.replaceReducer(combineReducers({...this._reducers, ...this._actions}));
        }
        this._listeners[namespace] = namespaceStateListener(this._store, namespace, looseEqual);
        this._unListeners[namespace] = this._store.subscribe(this._listeners[namespace]);
    }

    startup() {
        const {
            _history,
            _options: {container, suspense},
            $pm,
        } = this;
        $pm.start();
        $pm.apply(APP_HOOKS_ON_READY);

        ReactDOM.render(
            <Provider
                store={this._store}
                children={
                    <React.Suspense fallback={suspense ? suspense.fallback : <React.Fragment/>}>
                        <DuskContext.Provider value={this}>
                            <Router history={_history}
                                    children={<RouterView routes={this._routes}/>}/>
                        </DuskContext.Provider>
                    </React.Suspense>
                }
            />,
            query(container),
            this.callback.bind(this),
        );
    }


    callback() {
        this.$pm.apply(APP_HOOKS_ON_LAUNCH);
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
// interface Window {
//     [index: string]: any
// }
// declare var window: Window & typeof globalThis;
