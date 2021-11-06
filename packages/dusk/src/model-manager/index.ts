import { ReducersMapObject } from 'redux';
import produce from 'immer';

import { convertReduxAction, normalizationNamespace, defaultValue, lock } from '../util/internal';
import Dusk, { INITIAL_DATA, MODEL_TAG_GLOBAL, MODEL_TAG_SCOPED, NAMESPACE } from '../index';


export interface Model<S = object, D = any> {
    __complete__?: boolean;
    namespace: string;
    state: S;
    readonly initialData?: D;
    // reducers?: {
    //     // 当define model 时，会处理 reducer name 的 ':' 到 global ,会拼接 namespace 到 scoped
    //     [index: string]: Function;
    // };
    // reducer?: {};
    // subscriptions?: {
    //     state?: (oldValue, newValue, store, model) => void;
    //     keyEvents: () => void
    // };

    subscribe?: (oldValue: S, newValue: S, store, model: Model<S, D>) => void;

    scoped?: {
        // 当define model 时，不会处理 reducer name 的 ':' ,会拼接 namespace
        reducers?: {
            [index: string]: Function;
        };
        // subscriptions?: {
        //     [index: string]: () => void;
        // };
        // actions?: {
        //     [index: string]: Function
        // }
    };
    global?: {
        // 当define model 时，不会处理 reducer name 的 ':' ,也不会拼接 namespace
        reducers?: {
            [index: string]: Function;
        };
        // subscriptions?: {
        //     [index: string]: () => void;
        // };
        // actions?: {
        //     [index: string]: Function
        // }
    };
    actions?: {
        [index: string]: Function
    };

    setup?: (app: Dusk, store, model: Model<S, D>) => void;
}

export default class ModelManager {

    ctx: Dusk;

    models: {
        [namespace: string]: Model,
    } = {};

    reducers: ReducersMapObject = {};

    constructor(app: Dusk) {
        this.ctx = app;
    }

    get(namespace) {
        return this.models[namespace];
    }

    define(model: Model, options = { refresh: false, lazy: false, lock: true }) {
        const models = this.models;
        if (models[normalizationNamespace(model.namespace)]) {
            return;
        }

        function initialization(model: Model) {
            model.namespace = normalizationNamespace(model.namespace);
            model.actions = defaultValue(model.actions);
            model.scoped = defaultValue(model.scoped);
            model.global = defaultValue(model.global);
            model.scoped.reducers = defaultValue(model.scoped.reducers);
            // model.scoped.subscriptions = defaultValue(model.scoped.subscriptions);
            model.global.reducers = defaultValue(model.global.reducers);
            // model.global.subscriptions = defaultValue(model.global.subscriptions);
        }

        initialization(model);
        // lock(model, NAMESPACE);
        // lock(model, INITIAL_DATA);

        const { state: initialState, initialData, scoped, global, namespace } = model;
        // const {_unListeners, _models, _reducers, _listeners, $pm} = this;
        //
        //
        // function refresh() {
        //     _unListeners[namespace]();
        //     delete _models[namespace];
        //     delete _reducers[namespace];
        //     delete _listeners[namespace];
        //     delete _unListeners[namespace];
        // }


        // function parseModelMethodKey(key) {
        //     return {
        //         origin: key,
        //         parsed: key && key.replace(MODEL_TAG_GLOBAL, MODEL_TAG_SCOPED),
        //         global: key && key.indexOf(MODEL_TAG_GLOBAL) === 0,
        //     };
        // }

        // options.refresh && refresh();
        // options.lock && lockModel();


        // reducers &&
        // Object.keys(reducers).forEach((key) => {
        //     const {global, parsed} = parseModelMethodKey(key);
        //     const method = reducers[key];
        //     if (global) {
        //         object.global.reducers[parsed] = method;
        //     } else {
        //         object.scoped.reducers[namespace + NAMESPACE_SEPARATOR + key] = method;
        //     }
        // });

        // object.scoped.actions &&
        // Object.keys(object.scoped.actions).forEach((key) => {
        //     object.scoped.actions[namespace + NAMESPACE_SEPARATOR + key] = object.scoped.actions[key];
        //     delete object.scoped.actions[key];
        // });
        // @ts-ignore
        // object.scoped._actions = object.scoped.actions;
        // @ts-ignore
        // object.scoped.actions = bindActionCreators(object.scoped.actions || {}, this._store.dispatch);

        // Object.freeze(model.state);
        // const os = this._store.getState();

        this.reducers[namespace] = (state = initialState, dispatchedAction) => {
            // const method = global.reducers[type] || scoped.reducers[type];
            const action = convertReduxAction(dispatchedAction, model);
            const method = action.scoped ? scoped.reducers[action.name] : global.reducers[action.type];
            // 同一scope,执行scoped reducer
            // 不同scope,执行global reducer,要想不同namespace的model知道要执行哪个reducer则需要知道全名
            if (method) {
                return (model.state = produce(state, (draftState) => {
                    return method.apply(model, [draftState, {
                        ...initialData,
                        ...action.payload,
                    }]);
                }));
                // return (model.state = {
                //     ...method.apply(model, [state, {
                //         ...initialData,
                //         ...action.payload,
                //     }]),
                // });
            }
            return state;
        };

        // delete model.reducers;
        // delete model.subscriptions;
        // delete model.reducer;
        models[namespace] = model;
        model.__complete__ = true;
        model.setup && model.setup(this.ctx, this.ctx._store, model);
    }

    remove(model: Model) {
        const { models, reducers } = this;
        delete models[model.namespace];
        delete reducers[model.namespace];
    }

}
