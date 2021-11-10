import { RouteConfig } from 'react-router-config';
import Dusk, { bindActionCreators, DUSK_APPS_COMPONENTS, DUSK_APPS_MODELS, DUSK_APPS_ROUTES, Model, useAxios } from '../';
import * as React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { ComponentProperties } from '../component-manager';

// import {deprecate} from 'util';
//
// export function Deprecated(message: string): Function {
//     return (target: any, targetKey: string, descriptor: TypedPropertyDescriptor<any>) => {
//         const originalMethod = descriptor.value;
//         descriptor.value = deprecate(originalMethod, message);
//         return descriptor;
//     };
// }

export function cachedFunction() {
    console.log('f(): evaluated');
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log('f(): called');
    };
}


export function once() {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value = function once(fn) {
            var called = false;
            return function() {
                if (!called) {
                    called = true;
                    fn.apply(this, arguments);  // 是否需要返回值 return fn.apply(this,arguments)
                }
            };
        }(descriptor.value);
    };
}

function action(fn) {
    return function() {
        const { dispatch } = this.props;
        if (dispatch) {
            return dispatch(fn.apply(this, arguments));
        }
    };
}


export function dispatchAction() {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value = action(descriptor.value);
    };
}


// export function withDusk() {
//     return function (Component) {
//         return <Component />
//     };
// }

export function route(route: RouteConfig, wrapper?) {
    return function(target) {
        route.component = wrapper ? wrapper(target) : target;
        const metas = Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk);
        metas.push(route);
        Reflect.defineMetadata(DUSK_APPS_ROUTES, metas, Dusk);
    };
}

export function model() {

}

export function effect() {
    console.log('f(): evaluated');
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log('f(): called');
    };
}

export function reducer() {

}


export function routeBAK(route: RouteConfig, connectArgs?: Array<any>) {
    return function(target) {
        route.component = target;
        if (Array.isArray(connectArgs) && connectArgs.length > 0) {
            // @ts-ignore
            route.component = connect(...connectArgs)(target);
            // target.prototype.origin = origin;
        }
        const metas = Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk);
        metas.push(route);
        Reflect.defineMetadata(DUSK_APPS_ROUTES, metas, Dusk);
    };
}

export function container(tid: string, wrapper?, props: any = {}) {
    return function(target) {
        const metas: ComponentProperties[] = Reflect.getMetadata(DUSK_APPS_COMPONENTS, Dusk);
        // compose(withDusk, withRouter)(DynamicComponent)
        metas.push({
            tid,
            default: wrapper ? wrapper(target) : target,
            factory: target,
            props,
        });
        Reflect.defineMetadata(DUSK_APPS_COMPONENTS, metas, Dusk);
    };
}

export function define(model: Model) {
    return function(target) {
        const metas = Reflect.getMetadata(DUSK_APPS_MODELS, Dusk);
        metas.push(model);
        Reflect.defineMetadata(DUSK_APPS_MODELS, metas, Dusk);
        target.prototype.model = model;
    };
}


export function boundModel(model: Model) {
    return function(target): any {
        const metas = Reflect.getMetadata(DUSK_APPS_MODELS, Dusk);
        metas.push(model);
        Reflect.defineMetadata(DUSK_APPS_MODELS, metas, Dusk);

        target.prototype.model = model;
        // return class extends target {
        //     // @ts-ignore
        //     actions1 = bindActionCreators(model.actions || {}, this.props.dispatch);
        // };
        return class extends target {
            constructor(props: any) {
                super(props);
                if (!this.actions) {
                    // @ts-ignore
                    this.actions = bindActionCreators(model.actions || {}, props.dispatch);
                }
            }

        };
    };
}

export function Route1() {
    return function(target) {
        target.prototype.foo = 1;
    };
}

function _fetchApi(fn, options) {
    return function() {
        const { dispatch } = this.props;
        // const params = options.params.apply(this);

        const query = options.query || {
            foo: arguments[options.query.foo],
        };
        console.log(query);

        // if (dispatch) {
        //     return dispatch(fn.apply(this, arguments));
        // }
        const it = this;
        const { onSuccess } = fn.apply(this, arguments);


        return axios.get(options.url, {
            params: query,
        }).then((response) => response.data)
            .then((res) => {
                console.log(res);
                // fn.bind(this)(res);
                onSuccess.apply(this, [res]);
            });

        // return fetch(options.url)
        //     .then((response) => response.json())
        //     .then((res) => {
        //         console.log(res);
        //         fn.bind(this)(res);
        //     });

    };
}


export function fetchApi(options: {
    url?: string,
    method: 'get',
    params?: Function | object,
    query?: object,

} = { method: 'get' }) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        const params = Reflect.getMetadata('query', target, propertyKey) || {};
        // console.log(params);
        options.query = Object.assign({}, options.query, params);
        descriptor.value = _fetchApi(descriptor.value, options);
        // const fn = descriptor.value;
        // descriptor.value = () => {
        //     return fetch(options.url)
        //         .then((res) => res.json())
        //         .then((res) => {
        //             fn.apply(this, arguments);
        //         });
        // };
    };
}


const genParam = (symbolKey: string): Function => {
    return (paramName: string): Function => {
        return (target: any, propertyKey: string, paramIndex: number) => {
            // console.log(paramName);
            // console.log(paramIndex);
            const params = Reflect.getMetadata(symbolKey, target, propertyKey) || {};
            params[paramName] = paramIndex;
            Reflect.defineMetadata(symbolKey, params, target, propertyKey);
        };
    };
};

export const queryParam = genParam('query');
export const pathParam = genParam('path');

// @performance @timer @schedule

