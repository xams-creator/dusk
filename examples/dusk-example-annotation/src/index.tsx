import * as React from 'react';
import Dusk from '@xams-framework/dusk';

import App from './app';

Dusk.configuration.experimental.context = true;

const app = new Dusk({
    container: '#root',
    render(props) {
        return <App route={props.route} />;
    },
});

app.startup();
window.app = app;