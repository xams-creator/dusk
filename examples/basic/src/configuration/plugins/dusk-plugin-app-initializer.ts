import { definePlugin } from '@xams-framework/dusk';
import { resolvePath } from '@xams-framework/dusk';
import createDuskContextWebpack from '@xams-framework/dusk-plugin-context-webpack';
import createDuskHmr from '@xams-framework/dusk-plugin-hmr';

export default function createDuskAppInitializer() {
    return definePlugin({
        name: 'dusk-plugin-app-initializer',
        setup(app) {
            app.use(createDuskContextWebpack()).use(createDuskHmr());

            // @ts-ignore
            app.$router._navigate = app.$router.navigate;
            app.$router.navigate = interceptor(app, app.$router.navigate, (from: string, to: string) => {
                return to !== '/';
            });

            // 添加 popstate 监听器
            window.addEventListener('popstate', function (event) {
                // event.state 储存在 pushState 中的对象
                console.log('浏览器前进或后退！');
            });
        },
        // onRouteBefore({ app }, next, prevLocation, nextLocation) {
        //     console.log('pp before');
        // },
        // onRouteAfter({ app }, next, prevLocation, nextLocation) {
        //     console.log('pp after', prevLocation, nextLocation);
        //     if (1 === 1) {
        //         app.$router.navigate('/login');
        //     }
        // },
    });
}

// 定义AOP拦截器
function interceptor(app, fn: any, routeBefore?: (from: string, to: string) => boolean) {
    let prevLocationPathName: string = location.pathname;

    // app.$router.subscribe((state) => {
    //     if (prevLocationPathName !== state.location.pathname) {
    //         // @ts-ignore
    //         console.log('state', this);
    //         console.log(prevLocationPathName, state.location.pathname);
    //         // throw new Error()
    //     }
    // });
    return function () {
        // @ts-ignore
        const it: Router = this;

        const to = resolvePath(arguments[0], it.state.location.pathname);

        if (prevLocationPathName !== to.pathname) {
            if (routeBefore?.(prevLocationPathName, to.pathname) === false) {
                console.log('取消了导航');
                return;
            }
            console.log('before', '从', prevLocationPathName, '=>', to.pathname);
        }
        // @ts-ignore
        const ret = fn.apply(it, arguments);
        ret.catch(err => {
            console.log(err, '我也不知道');
        });
        ret.finally(() => {
            if (prevLocationPathName !== to.pathname) {
                console.log('after', '从', prevLocationPathName, '=>', it.state.location.pathname);
                prevLocationPathName = it.state.location.pathname;
            }
        });
        return ret;
    };
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
