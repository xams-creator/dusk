import axios, { AxiosInstance, AxiosStatic } from 'axios';
import { definePlugin } from '../../business';

export function createDuskInternalAxios(customAxios: AxiosInstance & AxiosStatic) {
    return definePlugin({
        name: 'dusk-plugin-internal-axios',
        setup(app) {
            // todo 需要去解决 axios 通用性的问题  axios.create() axios instance 引入方式不同带来结果不同
            app.$axios = customAxios || axios;

            // const handleError = (err: AxiosError) => {
            //     app.emit(APP_HOOKS_ON_HTTP_ERROR, err);
            //     return err;
            // };
            //
            // app.$axios.interceptors.request.use(config => {
            //     app.emit(APP_HOOKS_ON_HTTP_REQUEST, config);
            //     return config;
            // }, handleError);
            //
            // app.$axios.interceptors.response.use(res => {
            //     app.emit(APP_HOOKS_ON_HTTP_RESPONSE, res);
            //     return res;
            // }, handleError);

        },
    });
}
