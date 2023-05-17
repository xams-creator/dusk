import { Action, createDuskModel, DuskEffectPayloadAction, DuskModel, DuskPayloadAction } from '@xams-framework/dusk';
import { passwordLogin } from '@/common/api';
import { AnyAction } from 'redux';

export interface AppState {
    value: number,
    pending: boolean,
}

const model = createDuskModel({
    namespace: 'app',
    initialState: {
        value: 111,
        pending: false,
    } as AppState,
    reducers: {
        add(state, action) {
            state.value += 1;
        },
        startLoading(state, action) {
            state.pending = true;
        },
        stopLoading(state, action) {
            state.pending = false;
        },
    },
    effects: {
        async add(dispatch, state, { payload, resolve }, { put, sleep, app, model }) {
            // const res = await passwordLogin();
            // const a = await dispatch(add());

            // await sleep(1000);
            // put(payload);
            return 999;
        },
        async foo(dispatch) {
            const a = dispatch(add(1));
            const b = dispatch(model.commands.foo());
            const c = dispatch({
                type: 'add',
                payload: 1,
            });
            const e = dispatch({
                type: 'app/add',
                payload: 1,
                namespace: 'app',
                name: 'add',
                effect: false,
                scoped: true,
                effect123: 1,
            });
        },
    },
    onInitialization(state, model, app) {
        app.$hotkeys('ctrl+a', () => {

        });
    },
    onFinalize(state, model: DuskModel<AppState>, app) {
        app.$hotkeys.unbind('ctrl+a');
    },
});


export const { stopLoading } = model.actions;
export const { add, foo } = model.commands;
export default model;

