# Dusk

Lightweight frontend framework based on

- [react](https://github.com/facebook/react)
- [redux](https://github.com/reactjs/redux)
- [react-redux](https://github.com/reduxjs/react-redux)
- [redux-thunk](https://github.com/reduxjs/redux-thunk)
- [react-router](https://github.com/remix-run/react-router)
- [hotkeys-js](https://github.com/jaywcjlove/hotkeys)
- [axios](https://github.com/axios/axios)
- [immer](https://github.com/immerjs/immer)

## Features

- Typescript supports
- App lifecycle
- Plugin
- Simplified redux model
- HMR (craco、vite)

## Installation

```
$ npm i @xams-framework/dusk
```

## Usage

- ### Basic ([examples/dusk-example-count](https://github.com/xams-creator/dusk-examples/tree/master/dusk-example-count))
  #### index.tsx

```tsx
import { createApp, createDuskModel } from '@xams-framework/dusk';

const app = createApp({
    container: '#root',
});

app.define(createDuskModel({
    namespace: 'app',
    initialState: {
        value: 1,
    },
    reducers: {
        add(state) {
            state.value += 1;
        },
    },
}));

app.startup(<div>hello world!</div>);

console.log(app.state);  // {app: {value : 1}}
app.$store.dispatch({ type: 'app/add' });
console.log(app.state);  // {app: {value : 2}}


```

- ### Plugins ([examples/dusk-example-plugins](https://github.com/xams-creator/dusk-examples/tree/master/dusk-example-plugins))
  #### index.tsx

```tsx
    import React from 'react';
import { createApp } from '@xams-framework/dusk';
import createDuskAppLifecycle from '@/configuration/plugins/dusk-plugin-app-lifecycle';
import createDuskAppReady from '@/configuration/plugins/dusk-plugin-app-ready';
import createDuskCustomHooks from '@/configuration/plugins/dusk-plugin-custom-hooks';


const app = createApp({
    container: '#root',
});


app
    .use(createDuskAppLifecycle())
    .use(createDuskAppReady())
    .use(createDuskCustomHooks())
    .startup(<div>按F12请打开控制台</div>)
;

window.app = app;

```

![示例图片](public/images/plugin-call-log.png)

- ### HMR ([examples/dusk-example-hmr-craco](https://github.com/xams-creator/dusk-examples/tree/master/dusk-example-hmr-craco))

```shell
    npm i -D @xams-framework/craco-plugin-dusk-hmr
    npm i @xams-framework/dusk-plugin-hmr
```

- #### craco.config.ts

```tsx
import { CracoConfig } from '@craco/types';
import createCracoDuskHmr from '@xams-framework/craco-plugin-dusk-hmr';

function defineCraco(options: CracoConfig): CracoConfig {
    return options;
}

export default defineCraco({
    plugins: [createCracoDuskHmr()],
    webpack: {
        alias: {
            '@': 'src',
        },
    },
});
```

- #### index.tsx

```tsx
import { createApp } from '@xams-framework/dusk';
import createDuskHmr from '@xams-framework/dusk-plugin-hmr';

const app = createApp({
    container: '#root',
});

app
    .use(createDuskHmr())
    .startup()
;
```

- ### HMR ([examples/dusk-example-hmr-vite](https://github.com/xams-creator/dusk-examples/tree/master/dusk-example-hmr-vite))

```shell
    npm i -D @xams-framework/vite-plugin-dusk
    npm i @xams-framework/dusk-plugin-hmr
```

- #### vite.config.ts

```tsx
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import createViteDusk from '@xams-framework/vite-plugin-dusk';
import postcss from 'postcss-preset-env';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // const env = loadEnv(mode, process.cwd(), '');
    return {
        server: {
            port: 1339,
        },
        css: {
            postcss: {
                plugins: [postcss()],
            },
        },
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
                'src': path.join(__dirname, 'src'),
            },
        },
        plugins: [
            react(),
            createViteDusk(),
            eslint(),
        ],
    };
});


```

- #### index.tsx

```tsx
import { createApp } from '@xams-framework/dusk';
import createDuskHmr from '@xams-framework/dusk-plugin-hmr';

const app = createApp({
    container: '#root',
});

app
    .use(createDuskHmr())
    .startup()
;
```

## Apis

- ### createApp

```tsx
import Dusk, { createApp } from '@xams-framework/dusk';


const app = createApp({
    container: '#root',     // 挂载位置
    redux: {                // redux相关配置
        logger: {
            collapsed: true,
        },
    },
});

app
    .define(model)          // 定义一个模型，可以使用 dusk-plugin-context-webpack，vite 跳过手动定义
    .use(createPlugin())    // 使用一个插件
    .startup(<App />)       // 启动 App
```

- ### createDuskModel

```tsx
import { Action, createDuskModel, DuskEffectPayloadAction, DuskModel, DuskPayloadAction } from '@xams-framework/dusk';
import { passwordLogin } from '@/common/api';
import { AnyAction } from 'redux';

export interface AppState {
    value: number,
    pending: boolean,
}

const model = createDuskModel({
    namespace: 'app',   // 唯一命名空间
    initialState: {     // 支持函数语法 (namespace)=> initialState,也可以在函数体中根据namespace读本地存储的历史状态
        value: 111,
        pending: false,
    } as AppState,
    reducers: { // 更新 store 数据的 reducers，使用了 immer，因此可以直接修改值。创建完成时会同时创建 model.actions 用来dispatch事件
        add(state, action) {
            state.value += 1;
        },
        startLoading(state, action) {
            state.pending = true;
        },
        stopLoading(state, action) {
            state.pending = false;
        },
    },
    effects: {  // 异步函数，一般用来发 http 请求。创建完成时会同时创建 model.commands 用来dispatch事件
        // state: 当前空间的 state 而不是全局state
        // payload: 当前action调用时传的值
        // set: 看内部示例，可以在这里直接更新state
        // sleep: 配合 await 达到延时处理
        // app: 全局app示例,可以配合插件做一些事情
        // model: 当前model对象
        async add(dispatch, state, { payload }, { set, sleep, app, model }) {
            // const res = await passwordLogin();

            // set((state) => {
            //     state.pending = false
            // })

            // await sleep(1000);

            return 999;
        },
        async foo(dispatch, state, action) {
            const a = dispatch(add(1));
            const b = dispatch(model.commands.foo());
            const c = dispatch({
                type: 'add',
                payload: 1,
            });
            const e = dispatch({
                type: 'app/add',
                payload: 1,
                namespace: 'app',
                name: 'add',
                effect: false,
                scoped: true,
                effect123: 1,
            });
        },
    },
    // 模型被初始化时执行的事件
    onInitialization(state, model, app) {
        // 可以使用内置的 hotkeys 做快捷键绑定，需要手动在model被移除时清除,否则容易引发内存问题
        app.$hotkeys('ctrl+a', () => {

            // 把当前函数放在下一批微任务中执行，此时可以拿到完整的 models
            app.$scheduler(() => {
                console.log('hello micro task', app.models)
            })
        });
    },
    // 模型移除时执行
    onFinalize(state, model: DuskModel<AppState>, app) {
        app.$hotkeys.unbind('ctrl+a');
    },

    // 当前空间状态被修改后执行,可以在这里把新状态保存到本地存储
    onStateChange() {

    }
});


export const { stopLoading } = model.actions;
export const { add, foo } = model.commands;
export default model;

```

```tsx
import { useDispatch } from 'react-redux';
import model from './app.model';

const dispatch = useDispatch()
const res = await dispatch(model.commands.add()) // 如果是 commands ，那么返回的类型是 Promise
dispatch(model.actions.add())  // 如果是 actions ， 那么则是正常返回

```

- ### definePlugin
    - 定义一个插件

```tsx
import { definePlugin } from '@xams-framework/dusk';

export default function createDuskAppPlugin(options: any) {
    return definePlugin({
        name: 'dusk-plugin-app-hello',
        setup(app) {
            console.log('插件会在ready前调用')
        },
        onReady({ app }, next) {
            next();
        },
        //...其他生命周期，参考 dusk-examples 中的几个用例
    })
}
```

```tsx
import createDuskAppPlugin from './createDuskAppPlugin';

app.use(createDuskAppPlugin())
```

## Hooks

- ### useDusk
    - 函数组件中使用,返回当前app实例

```tsx
import { useDusk } from '@xams-framework/dusk';

const app = useDusk()
```

- ### useNamespacedSelector
    - 函数组件中使用,类似于 useSelector，提供一个 namespace 用来返回当前命名空间的state

```tsx
import { useNamespacedSelector } from '@xams-framework/dusk';

const state = useNamespacedSelector<any>('app') // model.namespace
```

## Plugins

- ### dusk-plugin-loading
    - 全局loading插件，dispatch effects 函数时会触发

```shell
npm i @xams-framework/dusk-plugin-loading
```

```tsx
import createDuskLoading from './index';

app.use(createDuskLoading)
```

```tsx
const [loading] = useLoading();
// 触发 loading start
app.$store.dispatch(model.commands.add())
// 触发 loading stop
```

- ### dusk-plugin-context-webpack
    - 使用此组件将会自动注册 src/business/inject 下定义的model，不需要手动define
    - webpack(craco)中可以用用 dusk-plugin-context-webpack
    - vite可以用 dusk-plugin-context-vite
```shell
npm i @xams-framework/dusk-plugin-context-webpack
```

```tsx
import createDuskContextWebpack from './index';

app.use(createDuskContextWebpack())
```

[comment]: <> (- ### )

[comment]: <> (## Examples)

[comment]: <> (- ### [examples/dusk-example-count]&#40;https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-count&#41;)

[comment]: <> (- ### [examples/dusk-example-routes]&#40;https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-routes&#41;)

[comment]: <> (- ### [examples/dusk-example-styles]&#40;https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-styles&#41;)

[comment]: <> (- ### [examples/dusk-example-plugins]&#40;https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-plugins&#41;)

[comment]: <> (- ### [examples/dusk-example-annotation]&#40;https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-annotation&#41;)

[comment]: <> (- ### [dusk-example-okr]&#40;https://github.com/xams-creator/dusk-example-okr&#41;)

[comment]: <> (  https://xams-creator.github.io/dusk-example-okr/)

[comment]: <> (  ```)

[comment]: <> (  username: dusk)

[comment]: <> (  password: dusk)

[comment]: <> (  ```)

