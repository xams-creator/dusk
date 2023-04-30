import Dusk, { definePlugin, DuskModel, useDusk, DynamicComponentProps } from '@xams-framework/dusk';
import { inWebpack } from '@xams-framework/common';
import * as React from 'react';


export interface DuskContextOptions {

    models?: string;
}

export default function createDuskContext(options?: DuskContextOptions) {

    return definePlugin({
        name: 'dusk-plugin-context',
        setup(app) {
            if (Dusk.configuration.experimental.context) {
                // @ts-ignore
                // let modules = require.context(
                //     (process.env.REACT_APP_PATH_SRC_ALIAS_NAME || 'src') + '/business',
                //     true,
                //     /\.(tsx|ts|js|jsx)$/
                // );
                // modules.keys().forEach(key => {
                //     modules(key);
                // });
                if (inWebpack()) {
                    // @ts-ignore
                    let modules = require.context(
                        // @ts-ignore
                        (process.env.REACT_APP_PATH_SRC_ALIAS_NAME || 'src') + '/business/models',
                        true,
                        /model\.(tsx|ts|js|jsx)$/,
                    );

                    modules.keys().forEach(key => {
                        const model: DuskModel = modules(key).default;
                        if (model && !!model.reducer) {
                            app.define(model as any);
                        }
                    });
                }
            }
        },
    });
}

export function useDynamicComponent(props: DynamicComponentProps) {
    const app = useDusk();
    const id = normalizeDotRule(props.id || props.typeId as string);
    let res;
    try {
        res = app._cm.components[id];
        if (!res) {
            // @ts-ignore
            res = require(`${(process.env.REACT_APP_PATH_SRC_ALIAS_NAME || 'src')}/${id}`);
            // const v = import(`@/${id}`)
        }
    } catch (e) {
        app.$logger.warn(`${e}, will use Dusk.configuration.suspense.renderLoading`);
        // throw e;
        return [() => {
            return (Dusk.configuration.suspense.renderLoading);
        }];
        // throw e;
    }
    return [res.default, res];
}

function normalizeDotRule(searchValue: string, replaceValue = '/'): string {
    return searchValue.replace(/\./g, replaceValue);
}

export function DynamicComponent(props: DynamicComponentProps) {
    const [Component] = useDynamicComponent(props);
    return (<Component {...props.props} />);
}
