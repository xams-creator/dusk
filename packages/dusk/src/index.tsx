import 'reflect-metadata';
import React from 'react';
import ReactDOM, { Root } from 'react-dom/client';
import EventEmitter from 'events';
import axios from 'axios';
import hotkeys from 'hotkeys-js';
import { Provider } from 'react-redux';
import { RouteObject } from 'react-router-dom';
import hoistStatics from 'hoist-non-react-statics';

import type { AxiosInstance, AxiosStatic } from 'axios';
import type { Router as RemixRouter } from '@remix-run/router';
import type { Store } from 'redux';
import type {
    DuskMode,
    DuskApplication,
    DuskConfiguration,
    DuskOptions,
    DuskRouterOptions,
} from './types';

import { createDuskInternalPreset, configuration } from './configuration';
import { scheduler } from './configuration/plugins/dusk-plugin-internal-scheduler';
import { initializeRouter } from './configuration/plugins/dusk-plugin-internal-router';
import {
    DUSK_APP, DUSK_APPS, DUSK_APPS_COMPONENTS, DUSK_APPS_MODELS, DUSK_APPS_ROUTES,
    query, readOnly,
} from './common';
import { DuskWrapper } from './components';
import { DuskContext } from './common/context';
import {
    PluginManager, APP_HOOKS_ON_READY, APP_HOOKS_ON_DESTROY, PluginFunction,
    ModelManager,
    ComponentManager,
    createDuskModel,
    CreateDuskModelOptions,
    DuskModel, ComponentOptions, APP_HOOKS_ON_MOUNTED,
} from './business';

import { Logger } from './configuration/plugins/dusk-plugin-internal-logger';


@Reflect.metadata(DUSK_APP, undefined)
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
    $logger: Logger;
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
        this.mode = options.mode;
        this.$hotkeys = hotkeys;
        this._pm = new PluginManager(this);
        this._mm = new ModelManager(this);
        this._cm = new ComponentManager(this);
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

    define(options: (CreateDuskModelOptions & DuskModel)): DuskApplication {
        this._mm.use(options.reducer ? options as DuskModel : createDuskModel(options));
        return this;
    }

    startup(children?: ((children: React.ReactNode) => React.ReactNode) | React.ReactNode | null) {
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
                        <DuskWrapper
                            ctx={this}
                            onMounted={() => {
                                if (!this._started) {
                                    emit(APP_HOOKS_ON_MOUNTED);
                                    this._started = true;
                                }
                            }}
                            children={children}
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
            this.$logger.warn('this $router is not initialized, reject operation!');
            return;
        }
        this.$router.routes.unshift(route as any);
        return this;
    }


    component(options: ComponentOptions) {
        this._cm.use(options);
        return this;
    }

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


export { hoistStatics } ;
export * from 'axios';
export { axios };
export { hotkeys };
export * from 'react-redux';
export * from 'redux';
export { EventEmitter } from 'events';
export * from 'react-router-dom';
export * from 'immer';

export * from './types';
export * from './business';
export * from './common';
export { withDusk } from './common/context';
export { useDuskModelActions, useDuskModel } from './business/model';
export { default as createApp } from './app';
