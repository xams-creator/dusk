import * as React from 'react';
import {RouterView, connect, RouteConfigComponentProps} from '@xams-framework/dusk';


export class TestChild extends React.Component<any> {

    render() {
        const {id}: any = this.props.match.params;
        return (
            <div>
                {id}
            </div>
        );
    }

}

export default connect(
    null,
    (dispatch) => {
        return {
            hello: () => {
                console.log('hello');
            },
            dispatch
        };
    }
)(class extends React.Component<RouteConfigComponentProps> {

    render() {
        const {route} = this.props;
        return (
            <div>
                test
                <RouterView routes={route.routes} extraProps={{foo: 'barbar'}}/>
            </div>
        );
    }

});
