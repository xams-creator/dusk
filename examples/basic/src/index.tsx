import React from 'react';
import Dusk, { createApp } from '@xams-framework/dusk';

import './index.css';
import router from '@/configuration/router';
import createDuskAppInitializer from '@/configuration/plugins/dusk-plugin-app-initializer';
import { wrap } from 'lodash';
import { Router } from '@remix-run/router/router';
import { Location } from '@remix-run/router';

Dusk.configuration.experimental.context = true;

const app = createApp({
    container: '#root',
    redux: {
        logger: {
            collapsed: true,
        },
    },
});

app
    .use(createDuskAppInitializer())
    .router(router)
    .startup();

window.app = app;

declare global {
    interface Window {
        [index: string]: any;
    }
}


// function interceptor(fn) {
//     console.log('method ...', fn);
//     return function() {
//         // 在方法执行前做一些拦截处理
//         console.log('method before');
//         // @ts-ignore
//         // const ret = fn.apply(this, arguments);
//         // console.log(ret);
//         // console.log('method end');
//         // return ret;
//         return fn;
//     };
// }
