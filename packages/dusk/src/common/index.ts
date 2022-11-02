// 常量
export const DUSK_APP = 'dusk.app';
export const DUSK_APPS = 'dusk.apps';
export const DUSK_APPS_MODELS = 'dusk.apps.@models';
export const DUSK_APPS_ROUTES = 'dusk.apps.@routes';
export const DUSK_APPS_ROUTES_CHILDREN = 'dusk.apps.@routes.@children';
export const DUSK_APPS_COMPONENTS = 'dusk.apps.@components';
export const NAMESPACE = 'namespace';
export const INITIAL_STATE = 'initialState';
export const REDUCERS = 'reducers';
export const EFFECTS = 'effects';
export const NAMESPACE_SEPARATOR = '/';
export const DOT = '.';
export const MODEL_TAG_GLOBAL = ':';
export const MODEL_TAG_SCOPED = '';

export const enum MODE {
    HASH = 'hash',
    BROWSER = 'browser',
    MEMORY = 'memory'
}


// hooks
export * from './hooks/use-creation';
export * from './hooks/use-update';
export * from './hooks/use-reactive';


// util
export * from './util/node-env';
export * from './util/logger';
export * from './util/';

// component
export * from './components';
