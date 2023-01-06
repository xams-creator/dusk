import { PluginFunction } from '@xams-framework/dusk';

export default function createFirstPlugin(): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-first',
            onReady(ctx, next) {
                console.log('on ready1');
            },
            onLaunch(ctx) {
                console.log('on launch');
            },
            onDestroy() {
                console.log('on destroy');
            },
            onPreEffectAction(ctx, next, action) {
                app.$store.dispatch({
                    type: 'app/startLoading',
                });
                console.log(action, 'pre');
            },
            onPostEffectAction(ctx, next, action) {
                app.$store.dispatch({
                    type: 'app/stopLoading',
                });
                console.log(action, 'post');
            },
            onStateChange(ctx, next, v1, v2, model) {
                console.log(v1, v2);
            },
            onHmr(ctx, next) {
                console.log('on hmr222334');
                next();
            },
        };
    };
}
