// 常量
export const DUSK_APP = 'dusk.app';
export const DUSK_APPS = 'dusk.apps';
export const DUSK_APPS_MODELS = 'dusk.apps.@models';
export const DUSK_APPS_ROUTES = 'dusk.apps.@routes';
export const DUSK_APPS_ROUTES_CHILDREN = 'dusk.apps.@routes.@children';
export const DUSK_APPS_COMPONENTS = 'dusk.apps.@components';

export const enum MODE {
    HASH = 'hash',
    BROWSER = 'browser',
    MEMORY = 'memory',
}

// hooks
export * from './hooks/use-namespaced-selector';
export * from './hooks/use-dusk';
export * from './hooks/use-axios';

// util
export * from './util/';
