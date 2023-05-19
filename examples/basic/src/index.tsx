import { createApp } from '@xams-framework/dusk';

import './index.scss';
import router from '@/configuration/router';
import createDuskAppInitializer from '@/configuration/plugins/dusk-plugin-app-initializer';

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

