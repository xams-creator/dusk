import 'reflect-metadata';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {createStore, combineReducers, Store, ReducersMapObject, applyMiddleware} from 'redux';
import {
    createHashHistory,
    createBrowserHistory,
    createMemoryHistory,
    History,
    HashHistoryBuildOptions,
    BrowserHistoryBuildOptions,

} from 'history';
import {Provider} from 'react-redux';
import {
    Router, SwitchProps, useHistory
} from 'react-router-dom';
import {renderRoutes, RouteConfig, RouteConfigComponentProps} from 'react-router-config';
import {isFunction, query, parseModelMethodKey, noop, looseEqual} from './util';
import model from './index.model';


export * from 'react-redux';
export * from 'redux';
export * from 'react-router-config';
export * from 'react-router-dom';

export * from './util';

import * as annotations from './annotation';
export const annotation = annotations;


// ============== constants ============== //
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


export interface AppOptions {
    [index: string]: any,

    history: {
        mode: 'hash' | 'browser' | 'virtual'    // router 模式
        options?: HashHistoryBuildOptions | BrowserHistoryBuildOptions
    } | History

    // redux?: {
    //
    // }

    routes?: (render) => Array<RouteConfig>
    models?: (() => Array<Model>) | Array<Model>

    container?: Element | DocumentFragment | null | string,
    callback?: () => void
    render?: (props?: RouteConfigComponentProps) => React.ReactElement       //

    configuration?: {
        routes: boolean // 是否启用路由配置扫描，扫描到 configuration/routes 后自动注入到上下文（todo 未实现）
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

    subscribe?: Function;

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
}

export function RouterView({routes, extraProps, switchProps}: { routes: RouteConfig[] | undefined, extraProps?: any, switchProps?: SwitchProps }) {
    return renderRoutes(routes, extraProps, switchProps);
}


let id = 0;

export default class Dusk {

    private readonly __id__: number;
    protected readonly _options;

    protected _history: History;
    protected _routes: Array<RouteConfig>;
    protected _store: Store;

    protected _contexts: any;

    private _models: { [index: string]: Model } = {};
    private _reducers: ReducersMapObject = {};
    private _listeners: { [index: string]: any } = {};

    constructor(options: AppOptions) {
        this.__id__ = ++id;
        this._options = options;

        this.register();
        this.init(options);
    }

    register() {
        const apps = Reflect.getMetadata(DUSK_APPS, Dusk);
        apps[this.__id__] = this;
        Reflect.defineMetadata(DUSK_APPS, apps, Dusk);
    }

    init(options) {
        const {history, models, routes, render} = options;
        // this._contexts = this.initContexts();
        this._history = !history.mode ? history : this.initHistory(history.mode, history.options);
        this._store = this.initStore(isFunction(models) ? models() : models);
        this._routes = this.initRoutes(isFunction(routes) ? routes(render) : routes);
    }

    initHistory(mode, options = {}) {
        switch (mode) {
            case Mode.BROWSER:
                return createBrowserHistory(options);
            default:
                return createHashHistory(options);
        }
    }

    initRoutes(routes: Array<RouteConfig> = []): Array<RouteConfig> {
        const {render} = this._options;
        if (!routes || routes.length === 0) {
            return [
                {
                    render: render
                },
            ];
        }
        return routes.concat(Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk));
    }

    initStore(models: Array<Model> = []) {
        const reducers = this.initStoreReducers(models);
        const middleware = this.initStoreMiddleware();
        const store = createStore(combineReducers(reducers), applyMiddleware(...middleware));
        this.initStoreListeners(store);
        return store;
    }

    initStoreReducers(models: Array<Model> = []) {
        models.unshift(model);
        models.concat(Reflect.getMetadata(DUSK_APPS_MODELS, Dusk)).forEach((model) => {
            this.define(model);
        });
        return this._reducers;
    }

    initStoreMiddleware(middlewares: Array<any> = []) {
        const actionMiddleware = (args?) => ({dispatch, getState}) => (next) => {
            return (action) => {
                if (typeof action === 'function') {
                    return action(dispatch, getState, args);
                }
                return next(action);
            };
        };
        return middlewares.concat([
            actionMiddleware()
        ]);
    }

    initStoreListeners(store) {
        const it = this;
        Object.keys(this._listeners).forEach((namespace) => {
            const model = this._models[namespace];

            function namespaceStateListener({getState}, namespace, compare = function (a, b) {
                return a == b;
            }) {
                let currentValue = getState()[namespace];
                return function () {
                    let newValue = getState()[namespace];
                    if (!compare(currentValue, newValue)) {
                        let oldValue = currentValue;
                        currentValue = newValue;
                        // console.log(`namespace: [${namespace}],`, `value:`, oldValue, ' => ', newValue);
                        model.subscribe && model.subscribe.apply(it, [oldValue, newValue, store, model]);
                    }
                };
            }

            this._listeners[namespace] = namespaceStateListener(store, namespace, looseEqual);
            store.subscribe(this._listeners[namespace]);
        });
        return this._listeners;
    }

    initContexts() {
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
        const requireModule = require.context(process.env.APP_PATH_CONFIGURATION, true,);
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
        window.r = requireModule;
        return requireModule;
    }

    define(model: Model, options = {refresh: false, lazy: false}) {
        if (options.refresh) {
            delete this._models[model.namespace];
            delete this._reducers[model.namespace];
        }
        Object.defineProperty(model, NAMESPACE, {
            writable: false,
            configurable: false
        });
        Object.defineProperty(model, INITIAL_DATA, {
            writable: false,
            configurable: false
        });

        const {namespace, state: initialState, initialData, reducers, scoped, global,} = model;
        const {reducers: srs, subscriptions: sbs} = scoped || {};
        const {reducers: grs, subscriptions: gbs} = global || {};

        const models = this._models;
        if (models[namespace] || (!reducers && !srs)) {
            // console.error('重复的namespace或者reducers未提供');
            return;
        }

        const object = {
            scoped: {
                reducers: {...srs,},
                subscriptions: {...sbs,}
            },
            global: {
                reducers: {...grs,},
                subscriptions: {...gbs}
            }
        };

        reducers && Object.keys(reducers).forEach((key) => {
            const {global, parsed} = parseModelMethodKey(key);
            const method = reducers[key];
            if (global) {
                object.global.reducers[parsed] = method;
            } else {
                object.scoped.reducers[namespace + NAMESPACE_SEPARATOR + key] = method;
            }
        });

        // const os = this._store.getState();
        this._reducers[namespace] = (state = initialState, {type, ...payload}) => {
            const method = object.global.reducers[type] || object.scoped.reducers[type];
            if (method) {
                return model.state = method.apply(model, [state, Object.assign({}, initialData, payload),]);
            }
            return state;
        };
        models[namespace] = Object.assign(model, object);
        this._listeners[namespace] = noop;
        if (this._store) {
            this._store.replaceReducer(combineReducers(this._reducers));
        }
    }


    startup() {
        const {_history, _options: {container}} = this;
        ReactDOM.render(
            <Provider
                store={this._store}
                children={
                    <Router history={_history} children={<RouterView routes={this._routes}/>}/>}
            />, query(container)
        );
    }
}


declare global {
    interface Window {
        [index: string]: any;
    }
}

Reflect.defineMetadata(DUSK_APPS, {}, Dusk);
Reflect.defineMetadata(DUSK_APPS_MODELS, [], Dusk);
Reflect.defineMetadata(DUSK_APPS_ROUTES, [], Dusk);

/**
 *  todo
 *
 *  1.如何通过注解 @Define(model) 定义模型
 *      答: 1.定义在 Dusk metadata 里,最终在实例构造时合并 models
 *
 *  2.如何优化 model.actions
 *      答: 2.注解 @DispatchAction ，是否为优解呢?
 *
 *  3.如何增加 model.subscriptions
 *      答: 3.参考 redux-watch 实现如何?，不同之处是我们的watch级别似乎只需要监视 namespace 值的变更. prev-namespace-state current-namespace-state
 *
 *  4.能否用 class 来构造 model , 假如用 class 来构造，如何访问 actions，如何访问 model 实例
 *      答: 由于 model 中包含了 namespace state ,并且 reducer 和 action function 最好在一个模块中，如果不需要同构和时间旅行似乎是个不错的选择
 *       ...
 *
 *  5.多个 dusk app 怎么处理
 *
 *  6.需要提供哪些注解来帮助我们使用 dusk
 *      答: @Fetch @Route @DispatchAction @DefineModel
 *
 *  7.假如一个项目存在多个store的情况，我应该如何用 dusk
 *
 *  8.使用 @Route 时，如何保证组件会被 connect。
 *      答: 使用者提供connect的参数,但是，由于注解会处理组件类，因此不需要额外的 connect !!!!!!
 *
 *  9.如何确保 @Route 的组件被预先加载，虽然可以使用 context，但是又被一步步推着走，用@Route后，又要约定 pages目录,这或许会和 wso 模型有冲突
 *
 *  10.当 namespace state 发生改变时，是否应该执行某些事件?
 *
 *  11.如何拆分 model， namespace， namespace的子model如何实现！！！！
 *
 * **/
