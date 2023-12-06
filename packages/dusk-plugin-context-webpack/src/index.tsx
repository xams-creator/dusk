import { inWebpack } from '@xams-framework/common';
import Dusk, { DuskModel, definePlugin } from '@xams-framework/dusk';

type WebpackContext = ((id: string) => any) & {
    keys(): string[];
};

export interface DuskContextOptions {
    context?: WebpackContext;
}

export default function createDuskContextWebpack({ context }: DuskContextOptions = {}) {
    return definePlugin({
        name: 'dusk-plugin-context-webpack',
        setup(app) {
            if (Dusk.configuration.experimental.context || Dusk.configuration.inject) {
                if (inWebpack()) {
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
                }
            }
        },
    });
}
