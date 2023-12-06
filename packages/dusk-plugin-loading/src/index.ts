import { PluginFunction, createDuskModel, definePlugin, useNamespacedSelector } from '@xams-framework/dusk';

export interface DuskLoadingState {
    loading: boolean;
}

export const model = createDuskModel({
    namespace: 'dusk-plugin-loading',
    initialState: (): DuskLoadingState => {
        return {
            loading: false,
        };
    },
    reducers: {
        start(state) {
            state.loading = true;
        },
        stop(state) {
            state.loading = false;
        },
    },
});

interface DuskLoadingOptions {
    excludes?: string[]; // 忽略哪些namespace
}

const name = 'dusk-plugin-loading';

export default function createDuskLoading(options: DuskLoadingOptions = {}): PluginFunction {
    const { excludes = [] } = options;
    return definePlugin({
        name,
        setup(app) {
            app.define(model);
        },
        onPreEffectAction({ app }, next, action) {
            const dispatch = app.$store.dispatch;
            if (!excludes.includes(action.namespace)) {
                const { loading }: DuskLoadingState = app.state[name];
                if (!loading) {
                    dispatch(model.actions.start());
                }
            }
            next();
        },
        onPostEffectAction({ app }, next, action) {
            const dispatch = app.$store.dispatch;
            next();
            if (!excludes.includes(action.namespace)) {
                const { loading }: DuskLoadingState = app.state[name];
                if (loading) {
                    dispatch(model.actions.stop());
                }
            }
        },
    });
}

export function useLoading(): [boolean] {
    const loading = useNamespacedSelector<DuskLoadingState>(model.namespace).loading;
    return [loading];
}
