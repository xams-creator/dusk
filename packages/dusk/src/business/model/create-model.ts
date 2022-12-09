import { convertReduxAction, getType, normalizationNamespace } from './common/util';
import {
    CreateDuskModelOptions,
    DuskActions, DuskCommands, DuskEffects,
    DuskModel,
    DuskReducers,
} from './types';
import produce from 'immer';
import { DUSK_APPS_MODELS } from '../../common';
import Dusk from '../../index';

export default function createDuskModel<S,
    R extends DuskReducers<S> = DuskReducers<S>,
    E extends DuskEffects<S> = DuskEffects<S>>(options: CreateDuskModelOptions<S, R, E>): DuskModel<S, R, E> {
    const {
        namespace,
        register = true,
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
    reducerNames.forEach((name) => {
        const method = options.reducers[name];
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
    });

    const effectNames = Object.keys(effects);
    const commands: DuskCommands<any> = {};
    effectNames.forEach((name) => {
        const type = getType(namespace, name);
        commands[name] = ((payload?) => {
            return {
                namespace,
                name,
                type,
                payload,
                effect: true,
                scoped: true,
            };
        });
    });


    const reducer = (state: S = initialState, dispatchedAction) => {
        const action = convertReduxAction(dispatchedAction, { namespace });
        const method = reducers[action.type];
        if (method) {
            return produce(state, (draftState) => {
                return method.apply(null, [draftState, action]);
            });
        }
        return state;
    };
    const model: DuskModel<S, R, E> = {
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
    };
    register && registerDuskModel(model);
    return model;
}


function registerDuskModel(model: DuskModel): DuskModel {
    const metas = Reflect.getMetadata(DUSK_APPS_MODELS, Dusk);
    metas.push(model);
    Reflect.defineMetadata(DUSK_APPS_MODELS, metas, Dusk);
    return model;
}
