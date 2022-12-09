import { convertReduxAction, getType, normalizationNamespace } from './util';
import {
    CreateDuskModelOptions,
    DuskActions,
    DuskModel,
    DuskReducers,
} from './types';
import produce from 'immer';
import { DUSK_APPS_MODELS } from '../../common';
import Dusk from '../../index';
import { TreeState } from 'dusk-examples-basic/src/business/tree/index.model';

export default function createDuskModel<S, R extends DuskReducers<S> = DuskReducers<S>>(options: CreateDuskModelOptions<S, R>): DuskModel<S, R> {
    const {
        namespace,
        register = true,
        onInitialization,
        onFinalize,
        onStateChange,
        effects,
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

    const names = Object.keys(options.reducers || {});
    const reducers: DuskReducers<S> = {};
    const actions: DuskActions<any> = {};
    names.forEach((name) => {
        const method = options.reducers[name];
        const type = getType(namespace, name);
        reducers[type] = method;
        actions[name] = ((payload?) => {
            return {
                type,
                payload,
            };
        });
    });
    const reducer = (state: S = initialState, dispatchedAction) => {
        const action = convertReduxAction(dispatchedAction);
        const method = reducers[dispatchedAction.type];
        if (method) {
            return produce(state, (draftState) => {
                return method.apply(null, [draftState, action]);
            });
        }
        return state;
    };
    const model: DuskModel<S, R> = {
        namespace: normalizationNamespace(namespace),
        initialState,
        reducers,
        actions,
        reducer,
        onInitialization,
        onFinalize,
        effects: effects,
        onStateChange,
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


//
// const model = createDuskModel({
//     namespace: 'tree',
//     initialState: (): TreeState => {
//         return {
//             foo: 1,
//             pending: false,
//         };
//     },
//     reducers: {
//         add(state, action) {
//             state.foo += 1;
//         },
//     },
//     effects: {
//         add(dispatch, state, action, { app, getState, put }) {
//             // put(111)
//             dispatch(model.actions.add(123));
//         },
//     },
//     onInitialization(app, model) {
//         console.log(app.state);
//     },
//     onStateChange(oldState, newState, model, app) {
//
//     },
// });
