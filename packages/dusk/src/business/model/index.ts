import { AnyAction, bindActionCreators, combineReducers, Dispatch, ReducersMapObject, Store } from 'redux';
import produce from 'immer';

import Dusk, {
    define,
    DUSK_APPS_COMPONENTS,
    DUSK_APPS_MODELS,
    DuskApplication, INITIAL_STATE,
    isFunction, isPlainObject, NAMESPACE, NAMESPACE_SEPARATOR,
    PluginFunction,
    useDusk,
    lock, MODEL_TAG_GLOBAL, MODEL_TAG_SCOPED, REDUCERS, EFFECTS,
} from '../../';
import { useMemo } from 'react';

export interface Model<S = object, D = any> {
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
            [index: string]: (state: S, data: any) => S | void
            // [index: string]: (state: S, data: any) => any;
            // [index: string]: Function
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
            [index: string]: (state: S, data: any) => S | void
        };
        // subscriptions?: {
        //     [index: string]: () => void;
        // };
        // actions?: {
        //     [index: string]: Function
        // }
    };
    actions?: {
        [index: string]: (state: S, data: any, helpers: { dispatch: Function, [index: string]: any }, app: (DuskApplication)) => any | Promise<any> | void
        // [index: string]: Function
    };
    commands?: ModelCommands;

    setup?: (app: (DuskApplication), store, model: Model<S, D>) => void;
}

export interface ModelCommands {
    [index: string]: (...args: any[]) => (dispatch) => Promise<any>;
}


export class ModelManager {

    ctx: DuskApplication;

    models: {
        [namespace: string]: ModelDefinition,
    } = {};

    reducers: ReducersMapObject = {};

    constructor(app: DuskApplication) {
        this.ctx = app;
    }

    get(namespace) {
        return this.models[namespace];
    }

    // define(model: Model, options = { refresh: false, lazy: false, lock: true }) {
    //     function initialization(model: Model) {
    //         model.namespace = normalizationNamespace(model.namespace);
    //         model.actions = defaultValue(model.actions);
    //         model.scoped = defaultValue(model.scoped);
    //         model.global = defaultValue(model.global);
    //         model.scoped.reducers = defaultValue(model.scoped.reducers);
    //         // model.scoped.subscriptions = defaultValue(model.scoped.subscriptions);
    //         model.global.reducers = defaultValue(model.global.reducers);
    //         model.commands = defaultValue(model.commands);
    //         // model.global.subscriptions = defaultValue(model.global.subscriptions);
    //     }
    //
    //     initialization(model);
    //
    //     // const {_unListeners, _models, _reducers, _listeners, $pm} = this;
    //     //
    //     //
    //     // function refresh() {
    //     //     _unListeners[namespace]();
    //     //     delete _models[namespace];
    //     //     delete _reducers[namespace];
    //     //     delete _listeners[namespace];
    //     //     delete _unListeners[namespace];
    //     // }
    //
    //
    //     // options.refresh && refresh();
    //     // options.lock && lockModel();
    //
    //     // object.scoped.actions &&
    //     // Object.keys(object.scoped.actions).forEach((key) => {
    //     //     object.scoped.actions[namespace + NAMESPACE_SEPARATOR + key] = object.scoped.actions[key];
    //     //     delete object.scoped.actions[key];
    //     // });
    //     // @ts-ignore
    //     // object.scoped._actions = object.scoped.actions;
    //     // @ts-ignore
    //     // object.scoped.actions = bindActionCreators(object.scoped.actions || {}, this.$store.dispatch);
    //
    //     // Object.freeze(model.state);
    //     // const os = this.$store.getState();
    //     model.commands = bindActionCreators(model.commands, this.ctx.$store.dispatch);
    //
    //     // delete model.reducers;
    //     // delete model.subscriptions;
    //     // delete model.reducer;
    // }

    remove(namespace?: string) {
        const app = this.ctx;
        const removeOne = (namespace: string) => {
            const model = this.get(namespace);
            model.onFinalize && model.onFinalize(app, model);
            delete this.models[model.namespace];
            delete this.reducers[model.namespace];
        };
        !namespace ? Object.keys(this.models).forEach(removeOne) : removeOne(namespace);
    }


    register<S>(model: ModelDefinition<S>): ModelDefinition<S> {
        const app = this.ctx;
        if (this.get(model.namespace)) {
            app.$logger.warn('模型已注册');
            return;
        }

        // model.namespace = normalizationNamespace(model.namespace);
        model.reducers = model.reducers || {};
        model.effects = model.effects || {};
        model.actions = model.actions || {};
        model.scoped = {
            reducers: {},
            actions: {
                ...model.actions,
            },
        };
        model.global = { reducers: {} };

        Object.keys(model.reducers).forEach((key) => {
            const method = model.reducers[key];
            const scoped = determineScope(key);
            if (scoped) {
                const isEffected = /.(pending|.fulfilled|.rejected)/.test(key);
                model.scoped.reducers[model.namespace + NAMESPACE_SEPARATOR + key] = method;
                if (!isEffected) {
                    model.scoped.actions[key] = model.actions[key] || ((payload) => {
                        return {
                            type: model.namespace + NAMESPACE_SEPARATOR + key,
                            payload,
                        };
                    });
                }
            } else {
                model.global.reducers[key.replace(MODEL_TAG_GLOBAL, MODEL_TAG_SCOPED)] = method;
            }
        });

        this.reducers[model.namespace] = (state = model.initialState, dispatchedAction) => {
            const action = convertReduxAction(dispatchedAction, model);
            const method = (action.scoped ? model.scoped : model.global).reducers[action.type];
            if (method) {
                return produce(state, (draftState) => {
                    return method.apply(model, [draftState, action]);
                });
            }
            return state;
        };

        model.scoped.actions = hitchActions(
            bindActionCreators(model.scoped.actions, app.$store.dispatch), model.scoped.actions,
        );

        app.$store.replaceReducer(combineReducers(this.reducers));
        this.models[model.namespace] = model;

        lockModelDefinition(model, [NAMESPACE, INITIAL_STATE, REDUCERS, EFFECTS, 'scoped', 'global']);
        model.onInitialization && model.onInitialization(app, model);
        return model;
    }
}

export interface DuskAction<P = any> extends AnyAction {
    namespace: string,
    name: string,
    payload: P
    effect: boolean
    scoped: boolean
}

function convertReduxAction({ type, effect, payload, ...rest }: any, model?: ModelDefinition): DuskAction {
    const namespace = type.substring(0, type.lastIndexOf(NAMESPACE_SEPARATOR));
    const name = type.substring(type.lastIndexOf(NAMESPACE_SEPARATOR) + 1, type.length);
    // const model = m || {};
    return {
        type,
        namespace: namespace,   // dispatch action 的 namespace
        name,          // 方法名,或者说执行的动作
        payload,   // 排除 type, effect 参数的数据
        effect: !!effect,       // 是否副作用函数
        scoped: namespace === model?.namespace,  // 是否和执行reducer的是同一个scope
        ...rest,
    };
}

// ==================== //
interface ModelLifecycle<S> {
    onInitialization?: (app: DuskApplication, model: ModelDefinition<S>) => void;
    onFinalize?: (app: DuskApplication, model: ModelDefinition<S>) => void;
}

interface PayloadAction<P = any> extends AnyAction {
    payload?: P;
}

export interface ModelDefinition<S = any> extends ModelLifecycle<S> {
    namespace: string;
    initialState: S; //| (() => S);

    reducers?: {
        [key: string]: (state: S, action: AnyAction) => void
    };
    actions?: {
        [key: string]: (opts?: any) => AnyAction
    };
    scoped?: {
        reducers?: {
            [key: string]: (state: S, action: AnyAction) => void
        };
        actions?: {
            [key: string]: (opts?: any) => AnyAction
        };
    };
    global?: {
        reducers?: {
            [key: string]: (state: S, action: AnyAction) => void
        };
    };

    effects?: {
        [key: string]: (dispatch: Dispatch, state: S, action: AnyAction, helpers: ModelEffectExtraHelper) => void
    };


}

interface ModelEffectExtraHelper {
    getState: any;

    app: DuskApplication;

    put: (payload?) => void;

    putIfPending: (payload?) => void;

    putIfFulfilled: (payload?) => void;

    putIfRejected: (payload?) => void;

    [key: string]: any;
}

export class DefaultListableModelFactory extends ModelManager {

}

export function registerModelDefinition<S>(model: ModelDefinition<S>): ModelDefinition<S> {
    const metas = Reflect.getMetadata(DUSK_APPS_MODELS, Dusk);
    metas.push(model);
    Reflect.defineMetadata(DUSK_APPS_MODELS, metas, Dusk);
    return model;
}

export function useModelDefinition(namespace: string): ModelDefinition {
    const app = useDusk();
    return app.models[namespace];
}

export function useModelDefinitionActions(namespace: string): { [key: string]: (opts?: any) => AnyAction } {
    const model = useModelDefinition(namespace);
    return useMemo(() => model.scoped.actions, [namespace]);
}


export function createEffectActionMiddleware(ctx: DuskApplication) {
    return (store: Store) => next => action => {
        if (action && isPlainObject(action)) {
            const effectAction = convertReduxAction(action);
            const { namespace, name, effect, type } = effectAction;
            if (effect) {
                const model = ctx.models[namespace];
                if (model) {
                    const method = model.effects?.[name];
                    if (method) {
                        const dispatch = store.dispatch;
                        const getState = store.getState;
                        return next(() => {
                            method.apply(
                                model, [dispatch, getState()[namespace], effectAction,
                                    {
                                        getState, app: ctx,
                                        put: (payload?) => {
                                            dispatch({ type, payload });
                                        },
                                        putIfPending: (payload?) => {
                                            dispatch({
                                                type: `${type}.pending`,
                                                payload,
                                            });
                                        },
                                        putIfFulfilled: (payload?) => {
                                            dispatch({
                                                type: `${type}.fulfilled`,
                                                payload,
                                            });
                                        },
                                        putIfRejected: (payload?) => {
                                            dispatch({
                                                type: `${type}.rejected`,
                                                payload,
                                            });
                                        },
                                    },
                                ],
                            );
                        });
                        // return next(method);
                        // action(dispatch, getState, extraArgument);;
                    }
                }
            }
        }
        return next(action);
    };
}

export function normalizationNamespace(namespace) {
    if (namespace[namespace.length - 1] === NAMESPACE_SEPARATOR) {
        return namespace.substring(0, namespace.lastIndexOf(NAMESPACE_SEPARATOR));
    }
    return namespace;
}

function determineScope(name: string): boolean {
    return name && name.indexOf(MODEL_TAG_GLOBAL) != 0;
    // return {
    //     // parsed: name && name.replace(MODEL_TAG_GLOBAL, MODEL_TAG_SCOPED),
    //     global: name && name.indexOf(MODEL_TAG_GLOBAL) === 0,
    // };
}

function lockModelDefinition(model: ModelDefinition, keys: string[]) {
    keys.forEach((key) => {
        lock(model, key);
    });
}

function hitchActions(actions, context) {
    if (typeof actions === 'function') {
        return actions.bind(context);
    }
    if (typeof actions !== 'object' || actions === null) {
        throw new Error('type error');
    }
    let boundActions = {};
    for (let key in actions) {
        let action = actions[key];
        if (typeof action === 'function') {
            boundActions[key] = action.bind(context);
        }
    }
    return boundActions;
}
