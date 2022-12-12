import 'reflect-metadata';
import React from 'react';
import ReactDOM, { Root } from 'react-dom/client';
import EventEmitter from 'events';
import axios from 'axios';
import hotkeys from 'hotkeys-js';
import { Provider } from 'react-redux';
import { RouteObject, RouterProvider } from 'react-router-dom';
import type { AxiosInstance, AxiosStatic } from 'axios';
import type { Router as RemixRouter } from '@remix-run/router';
import type { Store } from 'redux';

import type { DuskMode, DuskApplication, DuskConfiguration, DuskOptions, DuskRouterOptions } from './types';
import { createDuskInternalPreset, configuration } from './configuration';
import { scheduler } from './configuration/plugins/dusk-plugin-internal-scheduler';
import { initializeRouter } from './configuration/plugins/dusk-plugin-internal-router';
import {
    DUSK_APP,
    DUSK_APPS,
    DUSK_APPS_COMPONENTS,
    DUSK_APPS_MODELS,
    DUSK_APPS_ROUTES,
    MODE,
    query,
    readOnly,
} from './common';
import { DuskEventWrapper } from './components';
import { DuskContext } from './context';
import {
    PluginManager, APP_HOOKS_ON_LAUNCH, APP_HOOKS_ON_READY, APP_HOOKS_ON_DESTROY, PluginFunction,
    ModelManager,
    ComponentManager,
    createDuskModel,
} from './business';

import * as logger from './common/util/logger';
import { CreateDuskModelOptions } from './business/model/types';


@Reflect.metadata(DUSK_APP, {})
@Reflect.metadata(DUSK_APPS, new Map<any, DuskApplication>())
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
    static configuration: DuskConfiguration;

    _pm: PluginManager;
    _mm: ModelManager;
    _cm: ComponentManager;
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
        this._pm = new PluginManager(this);
        this._mm = new ModelManager(this);
        this.emit = this.emit.bind(this);
        this.use(createDuskInternalPreset(options));
    }

    emit(type: any, ...args: any[]): void {
        this._pm.apply(type, ...args);
    }

    router(router: DuskRouterOptions): DuskApplication {
        initializeRouter(this, router);
        return this;
    }

    define(options: CreateDuskModelOptions): DuskApplication {
        options.register = false;
        this._mm.use(createDuskModel(options));
        return this;
    }

    startup(children?: React.ReactNode) {
        if (this._started) {
            return;
        }
        const {
            $store,
            _options: { container, suspense },
            _pm,
            emit,
        } = this;
        _pm.start();
        emit(APP_HOOKS_ON_READY);
        this.$root = ReactDOM.createRoot(query(container), this._options.root);
        this.$root.render(
            <Provider store={$store}>
                <React.Suspense fallback={suspense?.fallback || Dusk.configuration.suspense.fallback}>
                    <DuskContext.Provider value={this}>
                        <DuskEventWrapper
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
                        />
                    </DuskContext.Provider>
                </React.Suspense>
            </Provider>,
        );
    }


    route(route: RouteObject) {
        if (!this.$router) {
            logger.warn('this $router is not initialized, reject operation!');
            return;
        }
        this.$router.routes.unshift(route as any);
        return this;
    }

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
        this._pm.dispose();
    }

}

readOnly(Dusk, 'configuration', configuration);


export { default as hoistStatics } from 'hoist-non-react-statics';
export * from 'axios';
export { axios };
export { hotkeys };
export * from 'react-redux';
export * from 'redux';
export { EventEmitter } from 'events';
export * from 'react-router-dom';

export * from './types';
export { PluginFunction, createDuskModel } from './business';
export * from './business/annotation';
export * from './common';
export { withDusk } from './context';
export { logger };
export { useDuskModelActions, useDuskModel } from './business/model';
export { default as createApp } from './app';
