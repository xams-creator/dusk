import { definePlugin } from '@xams-framework/dusk';
import { DuskContextOptions } from './index';


export default function createDuskContextVite({ context }: DuskContextOptions) {
    return definePlugin({
        name: 'dusk-plugin-context-vite',
        setup(app) {
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
        },
    });
}
