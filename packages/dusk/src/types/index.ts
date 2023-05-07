import React from 'react';
import { AxiosInstance, AxiosStatic } from 'axios';
import hotkeys from 'hotkeys-js';
import EventEmitter from 'events';
import { RouteObject } from 'react-router-dom';
import { HydrationState, Router as RemixRouter } from '@remix-run/router';
import { ReduxLoggerOptions } from 'redux-logger';
import { EnhancerOptions } from '@redux-devtools/extension';
import { Root, RootOptions } from 'react-dom/client';
import { Middleware, PreloadedState, ReducersMapObject, Store, StoreEnhancer } from 'redux';
// import { BrowserHistoryOptions, HashHistoryOptions, MemoryHistoryOptions, History } from 'history';
import { scheduler } from '../configuration/plugins/dusk-plugin-internal-scheduler';
import {
    PluginFunction, PluginManager,
    ModelManager,
    ComponentManager,
    CreateDuskModelOptions,
    DuskModel, ComponentOptions,
} from '../business';
import * as logger from '../common/util/logger';

// https://typescript.bootcss.com/interfaces.html 类静态部分与实例部分的区别
// export interface DuskConstructor {
//     new(options: DuskOptions): DuskApplication;
// }

export interface DuskApplication {
    $root: Root;

    $axios: AxiosInstance & AxiosStatic;
    $hotkeys: typeof hotkeys;
    $logger: typeof logger;
    // $history: History;
    $store: Store;
    $scheduler: typeof scheduler;
    $topic: EventEmitter;
    $router: RemixRouter;
    mode: DuskMode;

    readonly _options: DuskOptions;
    _pm: PluginManager;
    _mm: ModelManager;
    _cm: ComponentManager;
    _started: boolean;

    router(router: DuskRouterOptions): DuskApplication;

    /**
     * @public
     * 加载一个插件，返回dusk实例
     *
     * @example
     ```tsx
     function createDuskPluginApp(): PluginFunction{
    return (app) => {
        setup(){
            console.log('use时立即调用')
        }
    }
}
     app.use(createDuskPluginApp());
     ```
     */
    use(fn: PluginFunction): DuskApplication;

    component(options: ComponentOptions): DuskApplication;

    define<S = any>(options: CreateDuskModelOptions<S> & DuskModel<S>): DuskApplication;


    route(route: RouteObject): DuskApplication;

    emit(type, ...args): void;


    get state();

    get models();

    startup(children?: ((children: React.ReactNode) => React.ReactNode) | React.ReactNode): void;

    destroy(): void;
}

//
export interface DuskOptions {

    history?: DuskHistoryOptions;
    root?: RootOptions;

    axios?: AxiosInstance & AxiosStatic;
    router?: DuskRouterOptions;
    redux?: DuskReduxOptions;

    models?: DuskModelsOptions;
    components?: DuskComponentsOptions;
    // plugins?: PluginFunction[];

    suspense?: {
        // 使用 lazy 方式加载组件时可以提供 suspense.fallback ，RouteView也有参数支持 suspense, 一个是全局，一个是局部
        fallback: NonNullable<React.ReactNode> | null;
    };

    mode?: DuskMode;// router 模式
    container: Element | DocumentFragment | null | string;
    // render?: () => React.ReactNode; // 优先级低于 startup 传入的 children
//     // render?: (props?: RouteConfigComponentProps) => React.ReactElement; //
}

export interface DuskConfiguration {
    plugin: {
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
    inject: boolean;   // inject 需要配合 dusk-plugin-context 使用 ,自动注入一些内容，替换 experimental.context,默认 true，

    experimental: {
        context: boolean;   // 自动加载一些组件，需要和 cli 配合
        caught: boolean;   // true: 没处理就 preventDefault， false: 不处理
    };
    suspense: {
        fallback: NonNullable<React.ReactNode> | null        // options.suspense.fallback > fallback > renderLoading
        renderLoading: React.ReactElement
    };
}


// type HistoryBuildOptions = BrowserHistoryOptions | HashHistoryOptions | MemoryHistoryOptions;
export type DuskModelsOptions = CreateDuskModelOptions[] | DuskModel[]

export type DuskComponentsOptions = ComponentOptions[]

export type DuskReduxOptions = Partial<{
    reducers: ReducersMapObject;
    middlewares: Middleware[];
    enhancers: StoreEnhancer[];
    devTools?: boolean | EnhancerOptions;
    logger?: ReduxLoggerOptions;
    preloadedState: PreloadedState<any>
}>;

export type DuskHistoryOptions = Partial<{
    // options: HistoryBuildOptions;
}> | History

export type DuskRouterOptions = Partial<{
    routes: RouteObject[] | React.ReactNode,
    options?: {
        basename?: string;
        hydrationData?: HydrationState;
        window?: Window;

        initialEntries?: string[];
        initialIndex?: number;
    }
}> | RemixRouter

export type DuskMode = 'hash' | 'browser' | 'memory'
