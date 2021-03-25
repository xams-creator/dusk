import * as React from 'react';

import {connect, RouterView, Link} from '@xams-framework/dusk';

export class Demo extends React.Component<any, any> {

    render() {
        return (
            <div>
                Demo
                <Link to="/">go Home!</Link>
            </div>
        );
    }

}

export class App1 extends React.Component<any, any> {

    render() {
        const {route: {routes}, match: {params}} = this.props;
        return (
            <div>
                About
                <RouterView routes={routes} extraProps={{foo: 'bar'}}/>
            </div>
        );
    }

}

export class App1Detail extends React.Component<any, any> {

    render() {
        const {match: {params}} = this.props;
        return (
            <div>
                detail: {params.id}
                <br/>
                extraProps: {this.props.foo}
            </div>
        );
    }

}

export function App2() {
    return <div>Dashboard</div>;
}

class App extends React.Component<any, any> {


    render() {
        const {route: {routes}} = this.props;
        return (
            <div>
                Hello world dusk！

                <div>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/about">About</Link>
                            <ul>
                                <li>
                                    <Link to={'/about/1'} children={'about/1'}/>
                                </li>
                                <li>
                                    <Link to={'/about/2'} children={'about/2'}/>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <Link to="/dashboard">Dashboard</Link>
                        </li>

                    </ul>
                    <ul>
                        <li>
                            <Link to={'/demo'} children={'go => /demo'}/>
                        </li>
                    </ul>
                </div>
                <hr/>
                <RouterView routes={routes}/>
            </div>
        );
    }

}

export default App;
