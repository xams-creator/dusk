import { Draft } from 'immer';
import { Action, AnyAction, Dispatch, Reducer } from 'redux';

import { DuskApplication } from '../../../types';

export interface DuskPayloadAction<P = any> extends AnyAction {
    namespace: string;
    name: string;
    payload: P;
    effect: false;
    scoped: boolean;
}

export interface DuskEffectPayloadAction<P = any> extends AnyAction {
    namespace: string;
    name: string;
    payload: P;
    effect: true;
    scoped: boolean;
}

export type DuskReducer<S = any, A extends DuskPayloadAction = DuskPayloadAction> = (
    state: Draft<S>,
    action: A,
) => void;

export type DuskEffect<S = any, A extends DuskEffectPayloadAction = DuskEffectPayloadAction> = (
    dispatch: Dispatch,
    state: Readonly<Draft<S>>,
    action: A,
    helpers: DuskModelEffectExtraHelper<S>,
) => Promise<any> | void;

export interface CreateDuskModelOptions<S = any,
    R extends DuskReducers<S> = DuskReducers<S>,
    E extends DuskEffects<S> = DuskEffects<S>,
    > extends DuskModelLifecycle<S> {
    namespace: string;
    initialState: S | ((namespace: string) => S);
    reducers?: R;
    effects?: E;
}

export interface DuskModel<S = any,
    R extends DuskReducers<S> = DuskReducers<S>,
    E extends DuskEffects<S> = DuskEffects<S>,
    > extends DuskModelLifecycle<S> {
    namespace: string;
    initialState: S;
    reducers: DuskReducers<S>;
    actions: DuskActions<R>;
    reducer: Reducer<S>;

    effects?: DuskEffects<S>;
    commands: DuskCommands<E>;
}

export type DuskReducers<S> = {
    [key: string]: DuskReducer<S>;
};
export type DuskEffects<S> = {
    [key: string]: DuskEffect<S>;
};

export type DuskActions<R extends DuskReducers<any>> = {
    [Type in keyof R]: <P>(payload?: P) => DuskPayloadAction<P>;
};

export type DuskCommands<E extends DuskEffects<any>> = {
    [Type in keyof E]: <P>(payload?: P) => DuskEffectPayloadAction<P>;
};

export interface DuskModelLifecycle<S> {
    onInitialization?: (state: Readonly<S>, model: DuskModel<S>, app: DuskApplication) => void;
    onFinalize?: (state: Readonly<S>, model: DuskModel<S>, app: DuskApplication) => void;
    onStateChange?: (oldState: Readonly<S>, newState: Readonly<S>, model: DuskModel<S>, app: DuskApplication) => void;
}

export interface DuskModelEffectExtraHelper<S> {
    model: DuskModel<S>;

    getState: () => any;

    app: DuskApplication;

    put: <P = any>(payload?: P) => DuskPayloadAction<P>;

    sleep: (time: number) => Promise<Boolean>;

    set: (fn: (state: Draft<S>) => void) => void;

    // putIfPending: (payload?) => void;
    //
    // putIfFulfilled: (payload?) => void;
    //
    // putIfRejected: (payload?) => void;
    //
    // [key: string]: any;
}

declare module 'redux' {
    interface Dispatch<A extends Action = AnyAction> {
        <P = any>(action: DuskPayloadAction<P>): DuskPayloadAction<P>;

        <R = any, P = any>(action: DuskEffectPayloadAction<P>): Promise<R>;

        <T extends A>(action: T): T;
    }
}
