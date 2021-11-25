# Dusk

<!--[![Status](https://api.travis-ci.org/rstacruz/nprogress.svg?branch=master)](http://travis-ci.org/rstacruz/nprogress) -->
<!--[![npm version](https://img.shields.io/npm/v/nprogress.png)](https://npmjs.org/package/nprogress "View this project on npm")-->
<!--[![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/nprogress/badge?style=rounded)](https://www.jsdelivr.com/package/npm/nprogress)-->

Lightweight front-end framework based on

- [redux](https://github.com/reactjs/redux)
- [redux-thunk](https://github.com/reduxjs/redux-thunk)
- [react-router](https://github.com/remix-run/react-router)
- [history](https://github.com/ReactTraining/history)
- [axios](https://github.com/axios/axios)

## Installation

```
$ npm i @xams-framework/dusk
```

## Usage

- ### Basic ([examples/dusk-example-count](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-count))
  #### index.tsx

    ```
    import Dusk from '@xams-framework/dusk';

    const app = new Dusk({
        container: '#root',
        history: {
            mode: 'browser',    // 'browser' | 'hash' | 'memory'
        },  // optional， default 'browser'
        models: [
            {
                namespace: 'app1',
                state: {},
            }
        ],                      // optional config
        render({ route }) {
            return (
                <div>
                    hello world!
                </div>
            );
        },
    });

    app.define({
        namespace: 'app2',
        state: {},
    })

    app.startup();

    console.log(app.state);

    ```


- ### Routes ([examples/dusk-example-routes](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-routes))

  #### index.tsx

    ```
    import Dusk, { RouterView, RouteConfig } from '@xams-framework/dusk';

    const app = new Dusk({
        container: '#root',
        history: {
            mode: 'browser',    // 'browser' | 'hash'
        },
        routes(render): RouteConfig[] {
            return [
                {
                    path: ['/demo'],
                    exact: true,
                    component: Demo,
                },
                {
                    path: ['/'],
                    render: render,
                    routes: [
                        {
                            path: ['/about'],
                            component: App1,
                            routes: [
                                {
                                    path: ['/about/:id'],
                                    component: App1Detail,
                                },
                            ],
                        },
                        {
                            path: ['/dashboard'],
                            component: App2,
                        },
                    ],
                },
            ];
        },
        render({ route }) {
            return (
                <div>
                    <RouterView routes={route.routes}/>
                </div>
            );
        },
    });
    app.startup();

    ```
- ### Plugin ([examples/dusk-example-plugins](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-plugins))

  #### @xams-framework/dusk-plugin-axios
  - interceptors
  - local mock request
  - process business response and notify

  #### @xams-framework/dusk-plugin-hmr
  - integrated webpack hmr and provide dusk hooks

  #### app-validator.ts

    ```
    import Dusk, { PluginContext } from '@xams-framework/dusk';

    function isLoggedIn() {
        return !!localStorage.getItem('access_token');
    }

    export default function createValidator(options?: any) {
        return (app) => {
            const history = app.$history;
            return {
                name: 'app-login-validator',
                onLaunch(ctx, next) {
                    if (!isLoggedIn()) {
                        history.push('/user/login');
                    }
                    if (history.location.pathname === '/') {
                        history.push('/okr/home/basic?code=xams');
                    }
                    next();
                },
                onHmr(ctx, next){
                  console.log('before...')
                  next();
                  console.log('after...')
                }
            };
        };
    };
    ```

  index.tsx
    ```tsx
    <!--... ignored code -->
    import createAxios from '@xams-framework/dusk-plugin-axios';
    import createDuskHmr from '@xams-framework/dusk-plugin-hmr';
    import createValidator from './configuration/plugins/app-validator';
    app.use(createAxios({
        trigger: message,   // antd/message | antd/notification | antd/Modal | { success:() => void,error: () => void }
        enabledLocalMock: false, // if true, will intercept all request and proxy to local public dir
        mixin({ headers }) {
            headers['x-jwt'] = localStorage.getItem('XAMS_TOKEN_JWT');
            headers['authorization'] = localStorage.getItem('XAMS_ACCESS_TOKEN');
        },
    }));
    app.use(createDuskHmr());   
    app.use(createValidator());
    app.startup();

    <!--... ignored code -->
    ```
- ### Decorators ([examples/dusk-example-annotation](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-annotation))
    ```tsx
    import React from 'react';
    import { route, RouterView } from '@xams-framework/dusk';
    
    @route({
        path: '/route',
        routes: [
            {
                path: '/route/:id',
                exact: true,
                component: RouteDetail,
            },
        ],
    })
    class Route extends React.Component<any,any>{
        
        render(){
            return (<RouterView routes={this.props.route.routes} />)
        } 
    }
   ```

- ### Styles ([examples/dusk-example-styles](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-styles))


## Examples

- ### [examples/dusk-example-count](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-count)

- ### [examples/dusk-example-routes](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-routes)

- ### [examples/dusk-example-styles](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-styles)

- ### [examples/dusk-example-plugins](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-plugins)

- ### [examples/dusk-example-annotation](https://github.com/xams-creator/xams-framework-frontend/tree/master/examples/dusk-example-annotation)

- ### [dusk-example-okr](https://github.com/xams-creator/dusk-example-okr)

  https://xams-creator.github.io/dusk-example-okr/
  ```
  username: dusk

  password: dusk
  ```

