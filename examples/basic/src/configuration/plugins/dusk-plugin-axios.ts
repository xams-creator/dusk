import { ApiResponse } from '@xams-framework/common';
import { definePlugin } from '@xams-framework/dusk';
import { message } from 'antd';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export default function createDuskAppAxios() {
    return definePlugin({
        name: 'dusk-plugin-app-axios',
        setup(app) {
            const axios = app.$axios;

            axios.defaults.baseURL = process.env.REACT_APP_BACKEND_CONTEXT_PATH || '/';

            const handleError = (err: AxiosError) => {
                const { response } = err;
                if (response && response.status) {
                    const status = response.status;
                    switch (status) {
                        case 401:
                            if (process.env.REACT_APP_BACKEND_REDIRECT_URL) {
                                window.location.href = process.env.REACT_APP_BACKEND_REDIRECT_URL;
                            }
                            break;
                        case 404:
                            message.destroy();
                            message.error('请求失败,接口不存在');
                            break;
                        default:
                            if (status >= 500) {
                                message.error('系统异常');
                            }
                            break;
                    }
                }
                return Promise.reject(err);
            };

            axios.interceptors.request.use(config => {
                // mixin(config);
                return config;
            }, handleError);

            axios.interceptors.response.use(res => {
                // @ts-ignore
                if (['blob'].includes(res.config.responseType)) {
                    return res;
                }
                const { code, data, message: msg, success }: ApiResponse = res.data;
                const fn: Function = success ? message.success : message.error;

                if (!success) {
                    message.destroy();
                    fn(msg);
                    return res.data;
                }
                // @ts-ignore
                if (res.config.headers && convertBool(res.config.headers['notify'])) {
                    message.destroy();
                    // keypoint 后期需要改成后端msg
                    fn('ok');
                }
                return res.data;
            }, handleError);
        },
    });
}

const convertBool = (value: boolean | string | number) => {
    return typeof value === 'boolean' ? value : typeof value === 'number' ? !!value : value === 'true';
};

declare module '@xams-framework/dusk' {
    interface Axios {
        request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<T>;

        get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;

        delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;

        head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;

        options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;

        post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;

        put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;

        patch<T = any, R = AxiosResponse<T>, D = any>(
            url: string,
            data?: D,
            config?: AxiosRequestConfig<D>
        ): Promise<T>;

        postForm<T = any, R = AxiosResponse<T>, D = any>(
            url: string,
            data?: D,
            config?: AxiosRequestConfig<D>
        ): Promise<T>;

        putForm<T = any, R = AxiosResponse<T>, D = any>(
            url: string,
            data?: D,
            config?: AxiosRequestConfig<D>
        ): Promise<T>;

        patchForm<T = any, R = AxiosResponse<T>, D = any>(
            url: string,
            data?: D,
            config?: AxiosRequestConfig<D>
        ): Promise<T>;
    }
}
