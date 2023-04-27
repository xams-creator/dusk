// import { createDuskModel } from '@xams-framework/dusk';
//
// export default createDuskModel({
//     namespace: 'dashboard',
//     initialState: {
//         foo: 1,
//     },
//     reducers: {
//         add(state, action) {
//             state.foo += 1;
//         },
//         ':app/add': (state) => {
//             console.log('超级加倍');
//             state.foo += 10;
//         },
//     },
//     onInitialization(app, model) {
//         console.log(model.namespace, model.initialState.foo);
//     },
// });
