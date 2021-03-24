import * as React from 'react';

import {RouteConfig} from '@xams-framework/dusk';
import AppIndex2 from '../business/app2';
import Test, {TestChild} from '../business/app3';

// import Foo from './business/app1/foo';

export default function routes(render): Array<RouteConfig> {
    return [
        {
            path: ['/'],
            exact: true,
            render: render,
            // routes:
        },
        {
            path: ['/test'],
            component: Test,
            routes: [
                {
                    path: ['/test/:id'],
                    component: TestChild,
                },
            ]
        },
        {
            path: ['/foo'],
            component: AppIndex2,
        }
    ];
}
