import { AnyAction, Dispatch, Reducer } from 'redux';
import { Draft } from 'immer';
import { DuskApplication } from '../../../types';
import { ModelDefinition } from '../index';

export interface DuskPayloadAction<P = any> extends AnyAction {
    payload: P;
}

export type DuskReducer<S = any, A extends DuskPayloadAction = DuskPayloadAction> = (state: Draft<S>, action: A) => void;


export type DuskEffects<S = any, A extends DuskPayloadAction = DuskPayloadAction> = Record<string, (dispatch: Dispatch, state: Readonly<Draft<S>>, action: A, helpers: DuskModelEffectExtraHelper) => void>


export interface CreateDuskModelOptions<S = any, R extends DuskReducers<S> = DuskReducers<S>> extends DuskModelLifecycle<S> {
    namespace: string;
    initialState: S | ((namespace: string) => S);
    reducers: R;
    effects?: DuskEffects<S>;
    register?: boolean;
}


export interface DuskModel<S = any, R extends DuskReducers<S> = DuskReducers<S>> extends DuskModelLifecycle<S> {
    namespace: string;
    initialState: S;
    reducers: DuskReducers<S>;
    actions: DuskActions<R>;

    reducer: Reducer<S>;
    effects?: DuskEffects<S>;
}

export type DuskReducers<S> = {
    [key: string]: DuskReducer<S>
}

export type DuskActions<R extends DuskReducers<any>> = {
    [Type in keyof R]: <P>(payload?: P) => DuskPayloadAction<P>
}

export interface DuskModelLifecycle<S> {
    onInitialization?: (app: DuskApplication, model: DuskModel<S>) => void;
    onFinalize?: (app: DuskApplication, model: DuskModel<S>) => void;
    onStateChange?: (oldState: Readonly<S>, newState: Readonly<S>, model: DuskModel<S>, app: DuskApplication) => void;
}

export interface DuskAction<P = any> extends DuskPayloadAction<P> {
    namespace: string,
    name: string,
    payload: P
    effect: boolean
    scoped: boolean
}

export interface DuskModelEffectExtraHelper {
    getState: () => any;

    app: DuskApplication;

    put: <P>(payload?: P) => DuskPayloadAction<P>;

    // putIfPending: (payload?) => void;
    //
    // putIfFulfilled: (payload?) => void;
    //
    // putIfRejected: (payload?) => void;
    //
    // [key: string]: any;
}
