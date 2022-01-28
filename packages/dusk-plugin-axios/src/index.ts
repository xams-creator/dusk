import Dusk, { noop, Plugin, AxiosRequestConfig } from '@xams-framework/dusk';
import { convertBool } from '@xams-framework/common';
/*
* todo 后续可以增加是否返回origin res 的逻辑，考虑到特殊场景[blob]，可能不需要解析业务数据res.data,
* **/
declare module '@xams-framework/common' {
    interface ApiResponse<T = any> {
        hasError: () => boolean;
    }
}


interface IOptions {
    handleError?: (error: any) => any;
    mixin?: (config: AxiosRequestConfig) => void;
    hasBusinessError?: (res: any) => boolean;

    enabledLocalMock?: boolean;
    type?: 'message' | 'notification';
    trigger: any;


    /*
        首先会判断请求头的是否执行notify标志，在启用的情况下，判断执行策略
        always : 只要开启 notify 就执行通知
        only-success: 只要开启notify,只成功才通知
        only-error: 只要开启notify,只有失败才通知

    */
    strategy?: 'always' | 'only-success' | 'only-error';
    ignore?: {
        methods: string[] // 通过设置 'GET' 来让 GET 请求成功时不通知
    };
}

export default function createAxios(options: IOptions) {
    const {
        handleError = (err) => {
            // return ({ response }: any) => {
            //     if (response && response.status) {
            //         const status = response.status;
            //         if (status === 401) {
            //             localStorage.clear();
            //             options.trigger.error('请重新登录!');
            //         }
            //     }
            // };
            return Promise.reject(err);
        },
        mixin = (config: AxiosRequestConfig) => {

        },
        hasBusinessError = (res) => {
            return res.code !== 0;
        },
        trigger = {
            success: noop,
            error: noop,
            destroy: noop,
        },
        strategy = 'always',
        ignore = {
            methods: ['GET'],
        },
    } = options;

    return (app: Dusk): Plugin => {
        const axios = app.$axios;

        return {
            name: 'dusk-plugin-axios',
            onReady(ctx, next) {

                axios.interceptors.request.use((config) => {
                    mixin(config);
                    return config;
                }, handleError);

                axios.interceptors.response.use((res) => {
                    const { data, config } = res;
                    const { code, notify, message } = data;
                    const hasError = hasBusinessError(data);
                    const fn = !hasError ? trigger.success : trigger.error;
                    data.hasError = () => {
                        return hasError;
                    };
                    if (!hasError) {
                        if (ignore.methods.includes(config.method.toLocaleUpperCase())) {
                            return data;
                        }
                    }

                    if (notify || convertBool(config.headers.notify)) {
                        trigger.destroy();
                        fn(message);
                    }
                    return data;
                    // if (notify) {
                    //     trigger.destroy();
                    //     // switch (strategy) {
                    //     //     case 'only-success':
                    //     //         code === 0 && fn(message);
                    //     //         break;
                    //     //     case 'only-error':
                    //     //         code !== 0 && fn(message);
                    //     //         break;
                    //     //     default:
                    //     //         fn(message);
                    //     //         break;
                    //     // }
                    // }
                    // return data;
                }, handleError);
                if (options.enabledLocalMock) {
                    let method;

                    axios.interceptors.request.use((config: any) => {
                        method = config.method;
                        config.method = 'GET';
                        if (config.url.search('http') < 0) {
                            // @ts-ignore
                            config.url = `${process.env.BASE_URL}/api${config.url}/index.json`;
                        }
                        return config;
                    });
                    axios.defaults.transformResponse = [function(data) {
                        try {
                            return JSON.parse(data)[method.toLocaleUpperCase()];
                        } catch (e) {
                            throw e;
                        }
                    }];
                }
                next();

            },
        };
    };
};


export * from './annotation';
