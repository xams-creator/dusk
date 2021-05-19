import * as React from 'react';

import Dusk from '@xams-framework/dusk';

import App from './app';

const app = new Dusk({
    container: '#root',
    history: {
        mode: 'hash',
    },
    render(props) {
        return <App/>;
    },
});


app.startup();

