import * as React from 'react';
import Dusk from '@xams-framework/dusk';
import createValidator from '@/configuration/app-validator';
import createPrinter from '@/configuration/printer';


const app = new Dusk({
    container: '#root',
    history: {
        mode: 'hash',
    },
    render(props) {
        return <div>hello</div>;
    },
});

app.use(createPrinter())
app.use(createValidator());

window.app = app;
app.startup();
