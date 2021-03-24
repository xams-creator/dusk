import * as React from 'react';
import zhCN from 'antd/lib/locale/zh_CN';
import {ConfigProvider} from 'antd';
import 'antd/dist/antd.css';

import Dusk from '@xams-framework/dusk';
import App from './app';

// import routes from './configuration/routes';

const app = new Dusk({
    container: '#root',
    history: {
        mode: 'hash'
    },
    // routes: routes,
    render(props) {
        return (
            <ConfigProvider
                componentSize="middle"
                locale={zhCN}
                autoInsertSpaceInButton>
                <App route={props.route}/>
            </ConfigProvider>
        );
    }
});

window.app = app;
app.startup();

// @ts-ignore
if (module.hot) {
    // @ts-ignore
    module.hot.accept(() => {
        app.startup();
    });
}
