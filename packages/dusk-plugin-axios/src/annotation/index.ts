import { axios } from '@xams-framework/dusk';

// function _fetchApi(fn, options) {
//     return function() {
//         const { dispatch } = this.props;
//         // const params = options.params.apply(this);
//
//         const query = options.query || {
//             foo: arguments[options.query.foo],
//         };
//         console.log(query);
//
//         // if (dispatch) {
//         //     return dispatch(fn.apply(this, arguments));
//         // }
//         const it = this;
//         const { onSuccess } = fn.apply(this, arguments);
//
//
//         return axios.get(options.url, {
//             params: query,
//         }).then((response) => response.data)
//             .then((res) => {
//                 console.log(res);
//                 // fn.bind(this)(res);
//                 onSuccess.apply(this, [res]);
//             });
//
//         // return fetch(options.url)
//         //     .then((response) => response.json())
//         //     .then((res) => {
//         //         console.log(res);
//         //         fn.bind(this)(res);
//         //     });
//
//     };
// }

// export function fetchApi(options: {
//     url?: string,
//     method: 'get',
//     params?: Function | object,
//     query?: object,
//
// } = { method: 'get' }) {
//     return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
//         const params = Reflect.getMetadata('query', target, propertyKey) || {};
//         // console.log(params);
//         options.query = Object.assign({}, options.query, params);
//         descriptor.value = _fetchApi(descriptor.value, options);
//         // const fn = descriptor.value;
//         // descriptor.value = () => {
//         //     return fetch(options.url)
//         //         .then((res) => res.json())
//         //         .then((res) => {
//         //             fn.apply(this, arguments);
//         //         });
//         // };
//     };
// }

export function RequestMapping(
    options: {
        url?: string;
        method: 'GET' | 'POST';
        params?: Function | object;
        query?: object;
    } = { method: 'GET' }
) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        // const params = Reflect.getMetadata('query', target, propertyKey) || {};
        // console.log(params);
        // options.query = Object.assign({}, options.query, params);
        const fn = descriptor.value;
        descriptor.value = function (...args) {
            const result = fn.apply(this, args);
            return axios({
                ...options,
                ...result,
            });
        };
        return descriptor;
    };
}
