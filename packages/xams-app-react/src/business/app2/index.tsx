import * as React from 'react';
import Button from 'antd/es/button';

import model from './index.model';
import {connect, annotation} from '@xams-framework/dusk';

const {DefineModel, DispatchAction, Route} = annotation;



const {actions} = model;


// @Route(
//     {
//         path: '/app2',
//     },
//     [
//         (state: any, {route}: any) => {
//             return state.app;
//         },
//         (dispatch) => {
//             return {
//                 dispatch,
//                 ...actions
//             };
//         }
//     ]
// )
@DefineModel(model)
class App2Index extends React.Component<any> {

    componentDidMount() {
        window.appIndex2 = this;
    }

    @DispatchAction()
    add(val) {
        return {type: 'app/add', step: val};
    }

    render() {
        return (
            <div>
                app index
                <Button onClick={actions.add.bind(this, this.props.dispatch)}>+</Button>
                <Button onClick={() => {
                    this.props.dispatch(actions.minus(999));
                }}>-</Button>
                <Button onClick={() => {
                    this.add(999);
                }}>+++</Button>
                {this.props.count || 0}
            </div>
        );
    }

}

export default connect(
    (state: any, {route}: any) => {
        return state.app;
    }, (dispatch) => {
        return {
            dispatch,
            ...actions
        };
    }
)(App2Index);

// export default Route(
//     {
//         path: '/app2',
//     },
//     [
//         (state: any, {route}: any) => {
//             return state.app;
//         },
//         (dispatch) => {
//             return {
//                 dispatch,
//                 ...actions
//             };
//         }
//     ]
// )(App2Index);
