import { createDuskModel } from '@xams-framework/dusk';
import { passwordLogin } from 'src/common/api';

export interface AppState {
    value: number,
    pending: boolean,
}

const model = createDuskModel({
    namespace: 'app',
    initialState: {
        value: 1122,
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
        add: async (dispatch, state, { payload, resolve }, { put, sleep, app }) => {

            // const { data: res } = await passwordLogin();
            await sleep(1000);
            put(payload);
            // await setTimeout(() => {
            //     put(payload);
            //     //     putIfFulfilled();
            //     resolve();
            // }, 2500);
            // console.log(res);
            // return res;
            // put(action.payload);
            // console.log(2);
            // put(action.payload);
            // console.log(3);
        },
    },
    onInitialization(app, model) {
        app.$hotkeys('ctrl+a', () => {
            console.log(model.namespace);
        });
    },
});


export default model;

