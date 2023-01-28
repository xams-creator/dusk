import { createDuskModel, PluginFunction } from '@xams-framework/dusk';

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
    excludes?: string[];  // 忽略哪些namespace
}


export default function createDuskLoading(options: DuskLoadingOptions = {}): PluginFunction {
    const {
        excludes = [],
    } = options;
    return (app) => {
        return {
            name: 'dusk-plugin-loading',
            setup() {
                app.define(model);
            },
            onPreEffectAction(ctx, next, action) {
                const dispatch = app.$store.dispatch;
                if (!excludes.includes(action.namespace)) {
                    dispatch(model.actions.start());
                }
                next();
            },
            onPostEffectAction(ctx, next, action) {
                const dispatch = app.$store.dispatch;
                next();
                if (!excludes.includes(action.namespace)) {
                    dispatch(model.actions.stop());
                }
            },
        };
    };
}
