import { PluginFunction } from '../../business';
import Dusk, { DUSK_APP, DUSK_APPS } from '../../index';
import { DuskApplication } from '../../types';

export function getDuskApp(key?: any) {
    const metas: Map<any, DuskApplication> = Reflect.getMetadata(DUSK_APPS, Dusk);
    const app = metas.get(key);
    if (app) {
        return app;
    }
    return Reflect.getMetadata(DUSK_APP, Dusk);
}

function registerDuskApp(app: DuskApplication) {
    const metas: Map<any, DuskApplication> = Reflect.getMetadata(DUSK_APPS, Dusk);
    metas.set(app._options.container, app);
    Reflect.defineMetadata(DUSK_APPS, metas, Dusk);
    // Reflect.defineMetadata(DUSK_APP, app, Dusk);
}

function unregisterDuskApp(app: DuskApplication) {
    const metas: Map<any, DuskApplication> = Reflect.getMetadata(DUSK_APPS, Dusk);
    metas.delete(app._options.container);
    Reflect.defineMetadata(DUSK_APPS, metas, Dusk);
}

/**
 * 注册app到metadata中
 *
 * @internal
 */
export function createDuskInternalApp(): PluginFunction {
    return app => {
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
