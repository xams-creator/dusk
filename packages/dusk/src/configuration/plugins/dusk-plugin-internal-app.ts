import { PluginFunction } from '../../business';
import { DuskApplication } from '../../types';
import Dusk, { DUSK_APPS } from '../../index';

export function getDuskApp(key: any) {
    const metas: Map<any, DuskApplication> = Reflect.getMetadata(DUSK_APPS, Dusk);
    return metas.get(key);
}

function registerDuskApp(app: DuskApplication) {
    const metas: Map<any, DuskApplication> = Reflect.getMetadata(DUSK_APPS, Dusk);
    metas.set(app._options.container, app);
    Reflect.defineMetadata(DUSK_APPS, metas, Dusk);
}

function unregisterDuskApp(app: DuskApplication) {
    const metas: Map<any, DuskApplication> = Reflect.getMetadata(DUSK_APPS, Dusk);
    metas.delete(app._options.container);
    Reflect.defineMetadata(DUSK_APPS, metas, Dusk);
}

export function createDuskInternalApp(): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-app',
            onReady(ctx, next) {
                registerDuskApp(app);
                next();
            },
            onDestroy(ctx, next) {
                unregisterDuskApp(app);
                next();
            },
        };
    };
}

