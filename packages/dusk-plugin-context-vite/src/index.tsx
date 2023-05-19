import Dusk, { definePlugin } from '@xams-framework/dusk';
import { inVite } from '@xams-framework/common';

export interface DuskContextOptions {
    context?: any;
}

export default function createDuskContextVite({ context }: DuskContextOptions = {}) {
    return definePlugin({
        name: 'dusk-plugin-context-vite',
        setup(app) {
            if (Dusk.configuration.experimental.context || Dusk.configuration.inject) {
                if (inVite()) {
                    // @ts-ignore
                    const ctx = context || import.meta.glob([`src/business/inject/**/*.{ts,tsx,js,jsx}`], {
                        eager: true,
                        import: 'default',
                    });
                    Object.keys(ctx).forEach((key) => {
                        const model = ctx[key];
                        if (model && !!model.reducer) {
                            app.define(model);
                        }
                    });
                }
            }
        },
    });
}
