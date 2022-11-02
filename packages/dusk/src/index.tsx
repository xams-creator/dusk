import 'reflect-metadata';
import React from 'react';
import ReactDOM, { Root } from 'react-dom/client';
import EventEmitter from 'events';
import axios from 'axios';
import hotkeys from 'hotkeys-js';
import hoistStatics from 'hoist-non-react-statics';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import type { AxiosInstance, AxiosStatic } from 'axios';
import type { Router as RemixRouter } from '@remix-run/router';
import type { Store } from 'redux';

import {
    DUSK_APP, DUSK_APPS, DUSK_APPS_COMPONENTS, DUSK_APPS_MODELS, DUSK_APPS_ROUTES,
    MODE, EventWrapper,
    query,
} from './common';

import {
    PluginManager,
    APP_HOOKS_ON_LAUNCH,
    APP_HOOKS_ON_READY,
    APP_HOOKS_ON_DESTROY,
    PluginFunction,
} from './business/plugin';
import defineConfiguration, {
    createDuskInternalAxios,
    createDuskInternalRouter,
    createDuskInternalScheduler,
    createDuskTopic,
    createDuskInternalContext,
    createDuskInternalEvent,
    initializeRouter,
    scheduler,
    createDuskInternalRedux,
    createDuskInternalModels,
} from './configuration';

import { DuskContext } from './context';
import { DuskMode } from './types';
import { ModelDefinition, ModelManager } from './business/model';
import { ComponentManager } from './business/component/dusk-plugin-component';
import * as logger from './common/util/logger';

import type { DuskApplication, DuskConfiguration, DuskOptions, DuskRouterOptions } from './types';


@Reflect.metadata(DUSK_APP, {})
@Reflect.metadata(DUSK_APPS, {})
@Reflect.metadata(DUSK_APPS_MODELS, [])
@Reflect.metadata(DUSK_APPS_ROUTES, [])
@Reflect.metadata(DUSK_APPS_COMPONENTS, [])
export default class Dusk implements DuskApplication {
    $root: Root;
    $axios: AxiosInstance & AxiosStatic;
    $hotkeys: typeof hotkeys;
    $store: Store;
    $scheduler: typeof scheduler;
    $topic: EventEmitter;
    $logger: typeof logger;
    $router: RemixRouter;
    mode: DuskMode;

    readonly _options: DuskOptions;
//     _contexts: {
//         configuration: {};
//     };
//     _listeners: { [index: string]: () => void } = {};
//     _unListeners: { [index: string]: Function } = {};
    static configuration: DuskConfiguration;
//
//
    _pm: PluginManager;
    _mm: ModelManager;
    _cm: ComponentManager;
    _emitter: EventEmitter;
    _started = false;

    get state() {
        return this.$store.getState();
    }

    get models() {
        return this._mm.models;
    }

    constructor(options: DuskOptions) {
        this._options = options;
        this.mode = options.mode || MODE.BROWSER;
        this.$hotkeys = hotkeys;
        this.$logger = logger;
        this._emitter = new EventEmitter();
        this._pm = new PluginManager(this);
        this._mm = new ModelManager(this);
        this._init(options);
        this.emit = this.emit.bind(this);
    }

    emit(type: any, ...args: any[]): void {
        this._pm.apply(type, ...args);
    }


    protected _init({ models, redux, axios, router }: DuskOptions) {
        this
            .use(createDuskInternalContext())
            .use(createDuskInternalEvent())
            .use(createDuskInternalScheduler())
            .use(createDuskTopic())
            // .use(createDuskInternalModelManager())
            .use(createDuskInternalAxios(axios))
            // .use(createDuskInternalComponentManager())
            // .use(createDuskInternalRoutes(routes))
            .use(createDuskInternalRouter(router))
            .use(createDuskInternalRedux(redux))
            .use(createDuskInternalModels(models))

        ;
    }

    router(router: DuskRouterOptions): DuskApplication {
        initializeRouter(this, router);
        return this;
    }

    define<S>(model: ModelDefinition<S>): DuskApplication {
        this._mm.register(model);
        return this;
    }

//     // define(model: Model, options: any = { replace: true, refresh: false, lazy: false, lock: true }) {
//     //     const defineListener = (model) => {
//     //         const it = this;
//     //         const { $store, emit } = this;
//     //         if (this._listeners[model.namespace]) {
//     //             return;
//     //         }
//     //
//     //         function namespaceStateListener(store, namespace, compare = function(a, b) {
//     //             return a == b;
//     //         }) {
//     //             let currentValue = store.getState()[namespace];
//     //             return () => {
//     //                 let newValue = store.getState()[namespace];
//     //                 if (!compare(currentValue, newValue)) {
//     //                     let oldValue = currentValue;
//     //                     currentValue = newValue;
//     //
//     //                     emit(APP_HOOKS_ON_SUBSCRIBE, namespace, oldValue, newValue, store, model);
//     //                     if (model.subscribe) {
//     //                         logger.info(`namespace: [${namespace}],`, `value:`, oldValue, ' => ', newValue);
//     //                         model.subscribe.apply(it, [oldValue, newValue, store, model]);
//     //                     }
//     //                 }
//     //             };
//     //         }
//     //
//     //         this._listeners[model.namespace] = namespaceStateListener($store, model.namespace, looseEqual);
//     //         this._unListeners[model.namespace] = $store.subscribe(this._listeners[model.namespace]);
//     //     };
//     //
//     //     this._mm.define(model);
//     //     defineListener(model);
//     //     return this;
//     // }
//
    startup(children?: React.ReactNode) {
        const {
            $store,
            _options: { container, suspense },
            _pm,
            emit,
        } = this;
        if (!this._started) {
            _pm.start();
            emit(APP_HOOKS_ON_READY);
        }
        this.$root = ReactDOM.createRoot(query(container), this._options.root);
        this.$root.render(
            <Provider store={$store}>
                <React.Suspense fallback={suspense?.fallback || Dusk.configuration.suspense.fallback}>
                    <DuskContext.Provider value={this}>
                        <EventWrapper
                            ctx={this}
                            children={
                                this.$router ? <RouterProvider router={this.$router} /> : children
                            }
                            onLaunch={() => {
                                if (!this._started) {
                                    emit(APP_HOOKS_ON_LAUNCH);
                                    this._started = true;
                                }
                            }}
                            onUnmount={() => {
                                if (this._started) {
                                    emit(APP_HOOKS_ON_DESTROY);
                                    this._started = false;
                                }
                            }}
                            onError={() => {

                            }}
                        />
                    </DuskContext.Provider>
                </React.Suspense>
            </Provider>,
        );
    }


//     //
//     // route(route: RouteConfig) {
//     //     this._routes.unshift(route);
//     //     return this;
//     // }
//     //
//     // component(options: ComponentProperties) {
//     //     this._cm.component(options);
//     //     return this;
//     // }
//     //
    use(fn: PluginFunction): DuskApplication {
        this._pm.use(fn);
        return this;
    }

    destroy(): void {
        this.$root.unmount();
        this._emitter.removeAllListeners();
        this.$topic.removeAllListeners();
        this._mm.remove();
    }


}

defineConfiguration();

export function createApp(options: DuskOptions): DuskApplication {
    return new Dusk(options);
}

export { hoistStatics };
export * from 'axios';
export { axios };
export { hotkeys };
export * from './types';
export { EventEmitter } from 'events';
export { PluginFunction } from './business/plugin';
export * from 'react-router-dom';
export * from './business/annotation';
export * from './common';
export * from './context';
export { scheduler, logger };
export * from 'react-redux';
export * from 'redux';
export { registerModelDefinition, useModelDefinitionActions, useModelDefinition } from './business/model';
