import * as React from 'react';
import {connect, annotation} from '@xams-framework/dusk'

const {FetchApi, Once, PathParam} = annotation

// @Route1()
export default class Foo extends React.Component {

    componentDidMount() {
        window.foo = this;
    }


    @Once()
    demo(foo) {
        console.log(foo);
        return foo + 999;
    }

    @FetchApi({
        url: 'http://api.k780.com/?app=weather.today&weaid=1&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json',
        method: 'get',
        // params() {
        //     console.log(this);
        // }
    })
    fetchApi(
        // @PathParam('foo') f
    ) {

        return (res) => {
            console.log(res);
        };
    }

    render() {
        return (
            <div>foo</div>
        );
    }

}
