import { PluginFactory } from '../index';
import axios, { AxiosInstance, AxiosStatic } from 'axios';

export function createDuskInternalAxios(customAxios: AxiosInstance | AxiosStatic): PluginFactory {
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
