import { convertReduxAction, determineScope, getType, normalizationNamespace } from './common/util';
import { CreateDuskModelOptions, DuskActions, DuskCommands, DuskEffects, DuskModel, DuskReducers } from './types';
import produce from 'immer';
import { isFunction } from '../../common';

export default function createDuskModel<S,
    R extends DuskReducers<S> = DuskReducers<S>,
    E extends DuskEffects<S> = DuskEffects<S>>(options: CreateDuskModelOptions<S, R, E>): DuskModel<S, R, E> {
    const {
        namespace,
        onInitialization,
        onFinalize,
        onStateChange,
        effects = {},
    } = options;
    if (!namespace) {
        throw new Error('`namespace` is a required option for createDuskModel');
    }
    if (!options.initialState) {
        console.error('You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`');
    }
    const initialState: S =
        typeof options.initialState == 'function'
            ? (options.initialState as Function)(namespace)
            : options.initialState;

    const reducerNames = Object.keys(options.reducers || {});
    const reducers: DuskReducers<S> = {};
    const actions: DuskActions<any> = {};
    reducerNames.forEach((key) => {
        const { scoped, name } = determineScope(key);
        const method = options.reducers[key];
        if (scoped) {
            const type = getType(namespace, name);
            reducers[type] = method;
            actions[name] = ((payload?) => {
                return {
                    namespace,
                    name,
                    type,
                    payload,
                    effect: false,
                    scoped: true,
                };
            });
        } else {
            reducers[name] = method;
        }
    });

    const reducer = (state: S = initialState, dispatchedAction) => {
        const action = convertReduxAction(dispatchedAction, { namespace });
        const { scoped, name } = determineScope(action.name);
        const method = scoped ? reducers[action.type] : reducers[name];
        if (method) {
            return produce(state, (draftState) => {
                return method.apply(null, [draftState, action]);
            });
        }
        if (action.namespace === namespace && name === '') { // 说明是 set
            const { payload: set } = action;
            if (isFunction(set)) {
                return produce(state, (draftState) => {
                    return set.apply(null, [draftState]);
                });
            }
        }
        return state;
    };

    const effectNames = Object.keys(effects);
    const commands: DuskCommands<any> = {};
    effectNames.forEach((name) => {
        const type = getType(namespace, name);
        commands[name] = ((payload?, extraAction = {}) => {
            return {
                namespace,
                name,
                type,
                payload,
                effect: true,
                scoped: true,
                ...extraAction,
            };
        });
    });

    return {
        namespace: normalizationNamespace(namespace),
        initialState,
        reducers,
        actions,
        reducer,

        onInitialization,
        onFinalize,
        onStateChange,

        effects,
        commands,
    } as DuskModel<S, R, E>;
}
