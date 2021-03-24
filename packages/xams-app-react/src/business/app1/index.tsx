import * as React from 'react';
import Foo from './foo';
import {Button} from 'antd';

import {connect, renderRoutes, Link, annotation} from '@xams-framework/dusk';
import model from './index.model';

const {DefineModel, DispatchAction, FetchApi, PathParam, QueryParam, Route1} = annotation;

const {actions} = model;

function paramDecorator(target: any, method: string, paramIndex: number) {
    console.log(target, method, paramIndex);
}

function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    // let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
    // existingRequiredParameters.push(parameterIndex);
    // Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
    console.log(target, propertyKey);
}

function format(formatString: string) {
    return () => {
        console.log(formatString);
    };
}

function getFormat(target: any, propertyKey: string) {

}

@DefineModel(model)
class App1Index extends React.Component<any> {

    componentDidMount() {
        window.appIndex = this;
    }


    // @ts-ignore
    // @format('Hello, %s')
    private greeting: string;

    @DispatchAction()
    add(val) {
        return {type: 'app/add', step: val};
    }

    @DispatchAction()
    asyncAdd(val) {
        console.log(val);
        return (dispatch) => {
            dispatch({type: 'app/add', step: 1});
            // this.add(val);

            const url = 'http://api.k780.com/?app=weather.today&weaid=1&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json';
            return fetch(url)
                .then((res) => res.json())
                .then((res) => {
                    this.add(val);
                });

        };
        // return {type: 'app/add', step: val};
    }

    @FetchApi({
        url: 'http://api.k780.com/?app=weather.today',
        method: 'get',
        query: {
            weaid: 1,
            appkey: 10003,
            sign: 'b59bc3ef6191eb9f747dd4e83c99f2a4',
            format: 'json'
        }
    })
    fetchApi(@QueryParam('foo') foo: string) {
        console.log(foo);
        const {dispatch} = this.props;
        dispatch({type: 'app/add', step: 1});
        return {
            onSuccess: (res) => {
                console.log(foo);
                console.log(res);
                this.add(99);
            },
            onError: (err) => {

            }
        };


        // return (res) => {
        //     console.log(foo);
        //     console.log(res);
        // };
    }

    // @required
    demo(foo) {
        // var test = function(a, b, c) {
        //     return a + b + c;
        // };
        //
        // function getParameterNames(fn) {
        //     if(typeof fn !== 'function') return [];
        //     var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        //     var code = fn.toString().replace(COMMENTS, '');
        //     var result = code.slice(code.indexOf('(') + 1, code.indexOf(')'))
        //         .match(/([^\s,]+)/g);
        //     return result === null
        //         ? []
        //         : result;
        // }
        // console.log(getParameterNames(test)); // ['a', 'b', 'c']
    }


    render() {
        return (
            <div>
                app index 1
                <Button onClick={actions.add.bind(this, this.props.dispatch)}>+</Button>
                <Button onClick={() => {
                    this.props.dispatch(actions.minus(999));
                }}>-</Button>

                <br/>
                <Button onClick={() => {
                    this.add(999);
                }}>+++</Button>

                <Button onClick={() => {
                    this.asyncAdd(999);
                }}>+++</Button>

                <Button onClick={() => {
                    this.fetchApi('123');
                }}>+++</Button>
                {this.props.count || 0}
                <Foo/>
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
)(App1Index);
