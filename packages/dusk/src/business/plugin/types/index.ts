import { DuskApplication } from '../../../types';
import { DuskPayloadAction, DuskModel } from '../../model/types';

export type PluginFunction = (app: DuskApplication) => Plugin & PluginExtraHooks & PluginOnceHooks;
export type PluginFactory = PluginFunction;

export interface PluginExtraHooks {

}

export interface Plugin {
    name?: string
    setup?: (app: DuskApplication) => void  // fn.apply后的事件，0.22前写在plugin对象外面，现在增加一个函数统一放置
    order?: number  // 未实现，使用order从语义上看是否会带来混乱? app.use(1) app.use(2) 可能2先执行的问题
    onReady?: (ctx: PluginHookContext, next: () => void) => void,
    onLaunch?: (ctx: PluginHookContext, next: Function) => void,
    onDestroy?: (ctx: PluginHookContext, next: Function) => void,
    onDocumentVisible?: (ctx: PluginHookContext, next: Function, event: Event) => void,
    onDocumentHidden?: (ctx: PluginHookContext, next: Function, event: Event) => void,
    onStateChange?: (ctx: PluginHookContext, next: Function, oldState: Readonly<any>, newState: Readonly<any>, model: DuskModel, app: DuskApplication) => void
    onError?: (ctx: PluginHookContext, next: Function, msg: string, event: Event) => void,
    // [APP_HOOKS_ON_ROUTE_BEFORE]?: Function,
    // [APP_HOOKS_ON_ROUTE_AFTER]?: Function,
    onPreEffectAction?: (ctx: PluginHookContext, next: Function, action: DuskPayloadAction) => void;
    onPostEffectAction?: (ctx: PluginHookContext, next: Function, action: DuskPayloadAction) => void;

    [extraHooks: string]: any
}

export interface PluginOnceHooks {
    onceReady?: (ctx: PluginHookContext, next: Function) => void,
    onceLaunch?: (ctx: PluginHookContext, next: Function) => void,
    onceDocumentVisible?: (ctx: PluginHookContext, next: Function, event: Event) => void,
    onceDocumentHidden?: (ctx: PluginHookContext, next: Function, event: Event) => void,
    onceError?: (ctx: PluginHookContext, next: Function, msg: string, event: Event) => void,
}

export interface PluginHookContext {
    readonly app: DuskApplication,
    readonly type: string
    params?: any[]

    [key: string]: any
}
