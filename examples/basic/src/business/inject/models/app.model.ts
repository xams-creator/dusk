import { createDuskModel, DuskModel } from '@xams-framework/dusk';
import { passwordLogin } from '@/common/api';

export interface AppState {
    value: number,
    pending: boolean,
}

export default createDuskModel({
    namespace: 'app',
    initialState: {
        value: 111,
        pending: false,
    },
    reducers: {
        add(state, action) {
            state.value += 1;
        },
        startLoading(state) {
            state.pending = true;
        },
        stopLoading(state) {
            state.pending = false;
        },
    },
    effects: {
        async add(dispatch, state, { payload, resolve }, { put, sleep, app }) {
            // const { data: res } = await passwordLogin();
            await sleep(1000);
            put(payload);
            return 999;
        },
    },
    onInitialization(state, model, app) {
        app.$hotkeys('ctrl+a', () => {
            console.log(model.namespace);
            app.$store.dispatch(model.commands.add());
        });
    },
    onFinalize(state, model: DuskModel<AppState>, app) {
        app.$hotkeys.unbind('ctrl+a');
    },
});


