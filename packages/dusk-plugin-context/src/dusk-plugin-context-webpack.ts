import { definePlugin, DuskModel } from '@xams-framework/dusk';
import { DuskContextOptions } from './index';

export type WebpackContext = ((id: string) => any) & {
    keys(): string[];
};


export default function createDuskContextWebpack({ context }: DuskContextOptions) {
    return definePlugin({
        name: 'dusk-plugin-context-webpack',
        setup(app) {
            const ctx: WebpackContext =
                context ||
                // @ts-ignore
                require.context('src/business/inject', true, /\.(tsx|ts|js|jsx)$/);

            ctx.keys().forEach(key => {
                const model: DuskModel = ctx(key).default;
                if (model && !!model.reducer) {
                    app.define(model);
                }
            });

        },
    });
}
