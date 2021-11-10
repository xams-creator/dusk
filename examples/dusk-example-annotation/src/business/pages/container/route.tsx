import React from 'react';
import { DynamicComponent, route } from '@xams-framework/dusk';

@route({
    path: '/container',
})
export default class Route extends React.Component<any, any> {

    render() {
        return (
            <div>
                <fieldset>
                    <DynamicComponent tid={'pages/container/a'} />
                </fieldset>

                <fieldset>
                    <DynamicComponent tid={'pages/container/b'} />
                </fieldset>

                <fieldset>
                    <DynamicComponent tid={'pages/container/c'} />
                </fieldset>

                <fieldset>
                    <DynamicComponent tid={'pages/container/d'} props={{ platform: 'creator', backend: 'dawn', frontend: 'dusk' }} />
                </fieldset>
            </div>
        );
    }
}