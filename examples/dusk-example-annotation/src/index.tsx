import * as React from 'react';
import Dusk from '@xams-framework/dusk';
import createThirdPartyContainerPlugin from '@/business/pages/container/plugins/third-party-plugin';

import App from './app';

const app = new Dusk({
    container: '#root',
    render(props) {
        return <App route={props.route} />;
    },
});
app.use(createThirdPartyContainerPlugin());
app.startup();
window.app = app;