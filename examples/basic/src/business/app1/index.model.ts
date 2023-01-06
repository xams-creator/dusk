// import { createDuskModel } from '@xams-framework/dusk';
//
// export interface TreeState {
//     value: number,
//     pending: boolean,
// }
//
// export default createDuskModel({
//     namespace: 'tree',
//     initialState: (namespace): TreeState => {
//         // const value = sessionStorage.getItem(namespace);
//         // return value ? JSON.parse(value) : {
//         //     foo: 1,
//         //     pending: false,
//         // };
//         return {
//             value: 1,
//             pending: false,
//         };
//     },
//     reducers: {
//         add(state, action) {
//             state.value += 3;
//         },
//         ':app/add'(state, action) {
//             console.log(action);
//             state.value += 3123;
//         },
//     },
//     effects: {
//         async add(dispatch, state, action, { put, sleep }) {
//             // await sleep(5000);
//             await put(action.payload);
//         },
//     },
//     onInitialization(app, model) {
//         console.log(app.state);
//     },
//     onStateChange(oldState, newState, model) {
//         sessionStorage.setItem(model.namespace, JSON.stringify(newState));
//     },
// });
//
