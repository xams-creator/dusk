import {RouteConfig} from 'react-router-config';


//
//
// import React, {FunctionComponent, ComponentType, ReactNode} from 'react';
//
// class I18n {
//
// }
//
// const i18n = new I18n();
//
// export type I18nContext = {
//     i18n: I18n
//     defaultComponent?: ComponentType<{ children?: ReactNode }>
// }
//
// export type withI18nProps = {
//     i18n: I18n
// }
//
// export type I18nProviderProps = I18nContext & {
//     forceRenderOnLocaleChange?: boolean
// }
//
// const LinguiContext = React.createContext<I18nContext>(null);
//
// export function useLingui(): I18nContext {
//     const context = React.useContext<I18nContext>(LinguiContext);
//
//     // @ts-ignore
//     if (process.env.NODE_ENV !== 'production') {
//         if (context == null) {
//             throw new Error('useLingui hook was used without I18nProvider.');
//         }
//     }
//
//     return context;
// }
//
// export function withI18n(
//     o?: object
// ): <P extends withI18nProps>(
//     Component: ComponentType<P>
// ) => React.ComponentType<Omit<P, 'i18n'>> {
//     return <P extends withI18nProps>(
//         WrappedComponent: ComponentType<P>
//     ): ComponentType<P> => {
//         return (props) => {
//             if (process.env.NODE_ENV !== 'production') {
//                 if (typeof o === 'function' || React.isValidElement(o)) {
//                     throw new Error(
//                         'withI18n([options]) takes options as a first argument, ' +
//                         'but received React component itself. Without options, the Component ' +
//                         'should be wrapped as withI18n()(Component), not withI18n(Component).'
//                     );
//                 }
//             }
//
//             const {i18n} = useLingui();
//             return <WrappedComponent {...props} i18n={i18n}/>;
//         };
//     };
// }
//
// export const I18nProvider: FunctionComponent<I18nProviderProps> = ({
//                                                                        i18n,
//                                                                        defaultComponent,
//                                                                        forceRenderOnLocaleChange = true,
//                                                                        children,
//                                                                    }) => {
//     const makeContext = () => ({
//         i18n,
//         defaultComponent,
//     });
//     const getRenderKey = () => {
//         return (forceRenderOnLocaleChange ? (i18n.locale || 'default') : 'default') as string;
//     };
//
//     const [context, setContext] = React.useState<I18nContext>(makeContext()),
//         [renderKey, setRenderKey] = React.useState<string>(getRenderKey());
//
//     /**
//      * Subscribe for locale/message changes
//      *
//      * I18n object from `@lingui/core` is the single source of truth for all i18n related
//      * data (active locale, catalogs). When new messages are loaded or locale is changed
//      * we need to trigger re-rendering of LinguiContext.Consumers.
//      *
//      * We call `setContext(makeContext())` after adding the observer in case the `change`
//      * event would already have fired between the inital renderKey calculation and the
//      * `useEffect` hook being called. This can happen if locales are loaded/activated
//      * async.
//      */
//     React.useEffect(() => {
//         const unsubscribe = i18n.on('change', () => {
//             setContext(makeContext());
//             setRenderKey(getRenderKey());
//         });
//         if (renderKey === 'default') {
//             setRenderKey(getRenderKey());
//         }
//         if (forceRenderOnLocaleChange && renderKey === 'default') {
//             console.log('I18nProvider did not render. A call to i18n.activate still needs to happen or forceRenderOnLocaleChange must be set to false.');
//         }
//         return () => unsubscribe();
//     }, []);
//
//     if (forceRenderOnLocaleChange && renderKey === 'default') return null;
//
//     return (
//         <LinguiContext.Provider value={context} key={renderKey}>
//             {children}
//         </LinguiContext.Provider>
//     );
// };


export function CachedFunction() {
    console.log('f(): evaluated');
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log('f(): called');
    };
}

function once(fn) {
    var called = false;
    return function () {
        if (!called) {
            called = true;
            fn.apply(this, arguments);  // 是否需要返回值 return fn.apply(this,arguments)
        }
    };
}

import Dusk, {DUSK_APPS_MODELS, DUSK_APPS_ROUTES, Model} from '../';
import * as React from 'react';

export function Once() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value = once(descriptor.value);
    };
}

function action(fn) {
    return function () {
        const {dispatch} = this.props;
        if (dispatch) {
            return dispatch(fn.apply(this, arguments));
        }
    };
}

export function DispatchAction() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value = action(descriptor.value);
    };
}

export function Route(route: RouteConfig, connectArgs?: Array<any>) {
    return function (target) {
        if (connectArgs.length > 0) {
            // const origin = target;
            // @ts-ignore
            route.component = connect(...connectArgs)(target);
            // target.prototype.origin = origin;

        }

        const metas = Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk);
        metas.push(route);
        Reflect.defineMetadata(DUSK_APPS_ROUTES, metas, Dusk);
    };
}

export function Route2(route: RouteConfig, fn1?: any, fn2?: any) {
    return function (target) {
        route.component = connect(fn1, fn2)(target);

        const metas = Reflect.getMetadata(DUSK_APPS_ROUTES, Dusk);
        metas.push(route);
        Reflect.defineMetadata(DUSK_APPS_ROUTES, metas, Dusk);
    };
}


export function DefineModel(model: Model) {
    return function (target) {
        const metas = Reflect.getMetadata(DUSK_APPS_MODELS, Dusk);
        metas.push(model);
        Reflect.defineMetadata(DUSK_APPS_MODELS, metas, Dusk);

        target.prototype.model = model;
    };
}

export function Route1() {
    return function (target) {
        target.prototype.foo = 1;
    };
}

function fetchApi(fn, options) {
    return function () {
        const {dispatch} = this.props;
        // const params = options.params.apply(this);

        const query = options.query || {
            foo: arguments[options.query.foo]
        };
        console.log(query);

        // if (dispatch) {
        //     return dispatch(fn.apply(this, arguments));
        // }
        const it = this;
        const {onSuccess} = fn.apply(this, arguments);


        return axios.get(options.url, {
            params: query
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

import axios from 'axios';
import {connect} from 'react-redux';

export function FetchApi(options: {
    url?: string,
    method: 'get',
    params?: Function | object,
    query?: object,

} = {method: 'get'}) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        const params = Reflect.getMetadata('query', target, propertyKey) || {};
        // console.log(params);
        options.query = Object.assign({}, options.query, params);
        descriptor.value = fetchApi(descriptor.value, options);
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

export const QueryParam = genParam('query');
export const PathParam = genParam('path');

//
// export function withI18n1() {
//     return function (target) {
//         target.prototype.
//     };
// }

