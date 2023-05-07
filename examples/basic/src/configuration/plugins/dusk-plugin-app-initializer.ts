import { definePlugin } from '@xams-framework/dusk';
import createDuskHmr from '@xams-framework/dusk-plugin-hmr';
import createDuskContext from '@xams-framework/dusk-plugin-context';

export default function createDuskAppInitializer() {
    return definePlugin({
        name: 'dusk-plugin-app-initializer',
        setup(app) {
            app
                .use(createDuskContext())
                .use(createDuskHmr())
            ;
        },
        // onRouteBefore({ app }, next, prevLocation, nextLocation) {
        //     console.log('pp before');
        // },
        // onRouteAfter({ app }, next, prevLocation, nextLocation) {
        //     console.log('pp after', prevLocation, nextLocation);
        //     if (1 === 1) {
        //         app.$router.navigate('/login');
        //     }
        // },
    });
}
