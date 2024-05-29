import { Draft } from 'immer';
import { Action, UnknownAction, Dispatch, Reducer } from 'redux';

import { DuskApplication } from '../../../types';
import { WritableDraft, Immutable } from 'immer/dist/types/types-external';

// type Readonly<T> = {
//     readonly [K in keyof T]: T[K] extends object ? Readonly<T[K]> : T[K];
// };

export interface DuskPayloadAction<P = any> extends UnknownAction {
    namespace: string;
    name: string;
    payload: P;
    effect: false;
    scoped: boolean;
}

export interface DuskEffectPayloadAction<P = any> extends UnknownAction {
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
    state: Immutable<S>,
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
    actions: DuskActions<S, R>;
    reducer: Reducer<S>;

    effects?: DuskEffects<S>;
    commands: DuskCommands<S, E>;
}

export type DuskReducers<S> = Record<string, DuskReducer<S>>;
export type DuskEffects<S> = Record<string, DuskEffect<S>>;

export type DuskActions<S, R extends DuskReducers<S>> = {
    [Type in keyof R]: <P>(payload?: P) => DuskPayloadAction<P>;
};

export type DuskCommands<S, E extends DuskEffects<S>> = {
    [Type in keyof E]: <P>(payload?: P) => DuskEffectPayloadAction<P>;
};

export interface DuskModelLifecycle<S = any, R extends DuskReducers<S> = DuskReducers<S>, E extends DuskEffects<S> = DuskEffects<S>> {
    onInitialization?: (state: Readonly<S>, model: DuskModel<S, R, E>, app: DuskApplication) => void;
    onFinalize?: (state: Readonly<S>, model: DuskModel<S, R, E>, app: DuskApplication) => void;
    onStateChange?: (oldState: Readonly<S>, newState: Readonly<S>, model: DuskModel<S, R, E>, app: DuskApplication) => void;
}

export interface DuskModelEffectExtraHelper<S> {
    model: DuskModel<S>;

    getState: () => any;

    app: DuskApplication;

    put: <P = any>(payload?: P) => DuskPayloadAction<P>;

    sleep: (time: number) => Promise<Boolean>;

    set: (fn: (state: WritableDraft<S>) => void) => void;

    // putIfPending: (payload?) => void;
    //
    // putIfFulfilled: (payload?) => void;
    //
    // putIfRejected: (payload?) => void;
    //
    // [key: string]: any;
}

declare module 'redux' {
    interface Dispatch<A extends Action = UnknownAction> {
        <P = any>(action: DuskPayloadAction<P>): DuskPayloadAction<P>;

        <R = any, P = any>(action: DuskEffectPayloadAction<P>): Promise<R>;

        <T extends A>(action: T): T;
    }
}
