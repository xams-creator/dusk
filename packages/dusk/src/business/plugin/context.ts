import { PluginHookContext } from './types';

export function createPluginHookContext(app, type, ...args): PluginHookContext {
    return {
        app,
        type,
        params: args,
    };
}
