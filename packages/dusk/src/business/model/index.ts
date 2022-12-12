import { AnyAction, combineReducers, ReducersMapObject } from 'redux';
import AbstractManager from '../manager';
import {
    DuskApplication,
    useDusk,
    looseEqual,
} from '../../';
import {
    INITIAL_STATE,
    NAMESPACE,
    REDUCERS, EFFECTS,
} from './common';
import { lockDuskModel } from './common/util';
import { DuskModel } from './types';
import namespaceStateListener from './namespace-state-listener';

export class ModelManager extends AbstractManager<DuskModel> {

    ctx: DuskApplication;

    models: {
        [namespace: string]: DuskModel,
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
        const listener = this.subscribes[model.namespace] = namespaceStateListener(app, model, app.$store, looseEqual);
        this.unsubscribes[model.namespace] = app.$store.subscribe(listener);
        lockDuskModel(model, [NAMESPACE, INITIAL_STATE, REDUCERS, EFFECTS]);
        model.onInitialization && model.onInitialization(app, model);
    }

    get(namespace) {
        return this.models[namespace];
    }

    remove(namespace?: string) {
        const app = this.ctx;
        const removeOne = (namespace: string) => {
            const model = this.get(namespace);
            model.onFinalize?.(app, model);
            // delete this.models[model.namespace];
            delete this.reducers[model.namespace];
        };
        !namespace ? Object.keys(this.models).forEach(removeOne) : removeOne(namespace);
    }

    dispose(): void {
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


