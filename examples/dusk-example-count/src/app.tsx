import * as React from 'react';

import {connect} from '@xams-framework/dusk';


class App extends React.Component<any> {

    render() {
        return (
            <div>
                Hello world dusk！

                <br/>
                <button onClick={() => {
                    this.props.dispatch({type: 'app/add'});
                }}>+</button>
                <button onClick={() => {
                    this.props.dispatch({type: 'app/minus'});
                }}>-
                </button>
                {this.props.count || 0}
            </div>
        );
    }

}

export default connect(
    (state: any) => {
        return state.app;
    }, (dispatch) => {
        return {
            dispatch,
        };
    }
)(App);
