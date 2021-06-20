import * as React from 'react';
// import zhCN from 'antd/es/locale/zh_CN';
// import {ConfigProvider} from 'antd';
import Dusk, { RouterView } from '@xams-framework/dusk';
import { createDuskComponents } from '@xams-framework/dusk-components';
import createLoading from './configuration/plugins/dusk-loading';
import createValidator from './configuration/plugins/app-validator';

import './index.less';

Dusk.configuration.experimental.context = true;

const app = new Dusk({
    container: '#root',
    history: {
        mode: 'browser',
    },
    render({ route }) {
        return (
            <div>
                {/*componentSize="middle"*/}
                {/*locale={zhCN}*/}
                {/*autoInsertSpaceInButton>*/}
                <RouterView routes={route.routes} />
                {/*<Route component={App5} path={['/app5']}/>*/}
                {/*<Switch>*/}
                {/*<Route component={App5} path={['/foo/app5']}/>*/}
                {/*</Switch>*/}
            </div>
        );
    },
});

app.use(createLoading());
app.use(createValidator());
app.use(createDuskComponents());

app.startup();
window.app = app;
// if (module.hot) {
//     module.hot.accept(() => {
//         app.startup();
//     });
// }

