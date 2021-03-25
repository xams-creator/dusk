import * as React from 'react';

import Dusk from '@xams-framework/dusk';

import model from './index.model';
import App from './app';


const app = new Dusk({
    container: '#root',
    history: {
        mode: 'hash'
    },
    models: [
        model
    ],
    render(props) {
        return <App/>;
    }
});


window.app = app;
app.startup();

