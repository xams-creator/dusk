import React from 'react';
import 'src/business/app/index.css';

import { useNamespacedSelector, toString, useDispatch, Outlet, DynamicComponent } from '@xams-framework/dusk';
import model, { AppState } from 'src/business/app/index.model';


function App() {
    const state: AppState = useNamespacedSelector('app');
    const dispatch = useDispatch();
    return (
        <div className='App'>
            <button disabled={state.pending} onClick={() => {
                dispatch(
                    model.commands.add({
                        payload: 66666,
                        resolve: () => {
                            console.log('请求结束...');
                            // alert(123);
                        },
                    }),
                );
            }}>++
            </button>
            count {state.value} 11111
            <br />
            {toString(state.pending)}

            <DynamicComponent
                id={'foo'}
                props={{
                    foo: 1,
                }}
            />
            <Outlet />
        </div>
    );
}

export default App;
