import axios, { AxiosInstance, AxiosStatic } from 'axios';
import { PluginFunction } from '../../business/plugin';

export function createDuskInternalAxios(customAxios: AxiosInstance & AxiosStatic): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-axios',
            setup() {
                // todo 需要去解决 axios 通用性的问题  axios.create() axios instance 引入方式不同带来结果不同
                app.$axios = customAxios || axios;
            },
        };
    };
}
