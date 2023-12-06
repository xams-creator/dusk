import { createApp } from '@xams-framework/dusk';

import createDuskAppInitializer from '@/configuration/plugins/dusk-plugin-app-initializer';
import router from '@/configuration/router';

import './index.scss';

const app = createApp({
    container: '#root',
    redux: {
        logger: {
            collapsed: true,
        },
    },
});

app.router(router).use(createDuskAppInitializer()).startup();

window.app = app;
