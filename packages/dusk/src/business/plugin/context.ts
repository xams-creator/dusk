import { DuskApplication } from '../../types';

export interface PluginHookContext {
    readonly app: DuskApplication,
    readonly type: string
    params?: any[]

    [key: string]: any
}

export function createPluginHookContext(app, type, ...args): PluginHookContext {
    return {
        app,
        type,
        params: args,
    };
}
