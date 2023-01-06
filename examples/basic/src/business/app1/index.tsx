// import React from 'react';
// import 'src/business/app/index.css';
//
// import {
//     useNamespacedSelector,
//     toString, useDispatch,
// } from '@xams-framework/dusk';
// import model, { TreeState } from 'src/business/app1/index.model';
//
// export default function App1() {
//     const state = useNamespacedSelector<TreeState>(model.namespace);
//     const dispatch = useDispatch();
//     return (
//         <div className='App'>
//             <button onClick={() => {
//                 dispatch(model.commands.add(1));
//             }}>++
//             </button>
//             count {state.value}
//             <br />
//             {toString(state.pending)}
//         </div>
//     );
// }
