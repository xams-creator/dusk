import { DuskApplication } from '../../../types';
import { DuskModel, DuskPayloadAction } from '../../model/types';

// import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export type PluginFunction = (app: DuskApplication) => Plugin & PluginExtraHooks & PluginOnceHooks;

export interface PluginExtraHooks {}

export interface Plugin {
    name?: string;
    setup?: (app: DuskApplication) => void; // fn.apply后的事件，0.22前写在plugin对象外面，现在增加一个函数统一放置
    order?: number; // 未实现，使用order从语义上看是否会带来混乱? app.use(1) app.use(2) 可能2先执行的问题
    onReady?: <Context extends PluginHookContext = PluginHookContext>(ctx: Context, next: () => void) => void;
    onMounted?: <Context extends PluginHookContext = PluginHookContext>(ctx: Context, next: Function) => void;
    onDestroy?: <Context extends PluginHookContext = PluginHookContext>(ctx: Context, next: Function) => void;
    onDocumentVisible?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        event: Event
    ) => void;
    onDocumentHidden?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        event: Event
    ) => void;
    onStateChange?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        oldState: Readonly<any>,
        newState: Readonly<any>,
        model: DuskModel,
        app: DuskApplication
    ) => void;
    onError?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        msg: string,
        event: Event
    ) => void;
    // [APP_HOOKS_ON_ROUTE_BEFORE]?: Function,
    // [APP_HOOKS_ON_ROUTE_AFTER]?: Function,
    onPreEffectAction?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        action: DuskPayloadAction
    ) => void;
    onPostEffectAction?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        action: DuskPayloadAction
    ) => void;

    // onHttpRequest?: <Context extends PluginHookContext = PluginHookContext>(ctx: Context, next: Function, config: AxiosRequestConfig) => void;
    // onHttpResponse?: <Context extends PluginHookContext = PluginHookContext>(ctx: Context, next: Function, response: AxiosResponse) => void;
    // onHttpError?: <Context extends PluginHookContext = PluginHookContext>(ctx: Context, next: Function, error: AxiosError) => void;

    [extraHooks: string]: any;
}

export interface PluginOnceHooks {
    onceReady?: <Context extends PluginHookContext = PluginHookContext>(ctx: Context, next: Function) => void;
    onceLaunch?: <Context extends PluginHookContext = PluginHookContext>(ctx: Context, next: Function) => void;
    onceDocumentVisible?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        event: Event
    ) => void;
    onceDocumentHidden?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        event: Event
    ) => void;
    onceError?: <Context extends PluginHookContext = PluginHookContext>(
        ctx: Context,
        next: Function,
        msg: string,
        event: Event
    ) => void;
}

export interface PluginHookContext {
    readonly app: DuskApplication;
    readonly type: string;
    params?: any[];

    [key: string]: any;
}
