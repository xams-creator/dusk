import React from 'react';
import Dusk, { createApp } from '@xams-framework/dusk';
import createFirstPlugin from './configuration/plugins/dusk-plugin-first';
import './index.css';
import router from './configuration/router';
import createDuskHmr from '@xams-framework/dusk-plugin-hmr';
import createC from 'src/configuration/plugins/dusk-plugin-c';

Dusk.configuration.silent = false;
Dusk.configuration.experimental.context = true;

const app = createApp({
    container: '#root',
    redux: {
        devTools: true,
        logger: {
            collapsed: true,
        },
    },
});
app
    .use(createC())
    .use(createFirstPlugin())
    .use(createDuskHmr())
    .router(router)
    .startup();

window.app = app;
// window.Dusk = Dusk;
declare global {
    interface Window {
        [index: string]: any;
    }
}
declare var module: {
    hot: {
        accept: (...args) => void
    }
};
if (module.hot) {
    module.hot.accept();
}
