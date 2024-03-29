import { AnyAction, ReducersMapObject, combineReducers } from 'redux';

import { DuskApplication, looseEqual, useDusk } from '../../';
import AbstractManager from '../manager';
import { EFFECTS, INITIAL_STATE, NAMESPACE, REDUCERS } from './common';
import { lockDuskModel } from './common/util';
import namespaceStateListener from './namespace-state-listener';
import { DuskModel } from './types';

export class ModelManager extends AbstractManager<DuskModel> {
    ctx: DuskApplication;

    models: {
        [namespace: string]: DuskModel;
    };

    subscribes: {
        [namespace: string]: Function;
    };
    unsubscribes: {
        [namespace: string]: Function;
    };

    reducers: ReducersMapObject;

    initialization() {
        this.models = {};
        this.reducers = {};
        this.subscribes = {};
        this.unsubscribes = {};
    }

    use(model: DuskModel) {
        const app = this.ctx;
        if (this.get(model.namespace)) {
            app.$logger.warn(`model ${model.namespace} already exists`);
            return;
        }
        this.models[model.namespace] = model;
        this.reducers[model.namespace] = model.reducer;
        app.$store.replaceReducer(combineReducers(this.reducers));
        const listener = (this.subscribes[model.namespace] = namespaceStateListener(
            app,
            model,
            app.$store,
            looseEqual
        ));
        this.unsubscribes[model.namespace] = app.$store.subscribe(listener);
        lockDuskModel(model, [NAMESPACE, INITIAL_STATE, REDUCERS, EFFECTS]);
        model.onInitialization && model.onInitialization(model.initialState, model, app);
        app.$logger.info(`use model ${model.namespace}`);
    }

    get(namespace) {
        return this.models[namespace];
    }

    remove(namespace?: string) {
        const app = this.ctx;
        const removeOne = (namespace: string) => {
            const model = this.get(namespace);
            if (model) {
                model.onFinalize?.(model.initialState, model, app);
                this.unsubscribes[model.namespace]();
                delete this.reducers[model.namespace];
                delete this.models[model.namespace];
            }
        };
        !namespace ? Object.keys(this.models).forEach(removeOne) : removeOne(namespace);
    }

    dispose(): void {
        this.remove();
    }
}

// ==================== //

export function useDuskModel(namespace: string): DuskModel {
    const app = useDusk();
    return app.models[namespace];
}

export function useDuskModelActions(namespace: string): { [key: string]: (opts?: any) => AnyAction } {
    const model = useDuskModel(namespace);
    return model.actions;
}
