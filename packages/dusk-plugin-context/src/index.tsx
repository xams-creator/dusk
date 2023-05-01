import Dusk, { definePlugin } from '@xams-framework/dusk';
import { inWebpack } from '@xams-framework/common';
import createDuskContextWebpack, { WebpackContext } from './dusk-plugin-context-webpack';

export interface DuskContextOptions {
    context?: WebpackContext;
}

export default function createDuskContext(options: DuskContextOptions = {}) {
    return definePlugin({
        name: 'dusk-plugin-context',
        setup(app) {
            if (Dusk.configuration.experimental.context || Dusk.configuration.inject) {
                if (inWebpack()) {
                    app.use(createDuskContextWebpack(options));
                }
            }
        },
    });
}

// export function useDynamicComponent(props: DynamicComponentProps) {
//     const app = useDusk();
//     const id = normalizeDotRule(props.id || props.typeId as string);
//     let res;
//     try {
//         res = app._cm.components[id];
//         if (!res) {
//             // @ts-ignore
//             res = require(`${(process.env.REACT_APP_PATH_SRC_ALIAS_NAME || 'src')}/${id}`);
//             // const v = import(`@/${id}`)
//         }
//     } catch (e) {
//         app.$logger.warn(`${e}, will use Dusk.configuration.suspense.renderLoading`);
//         // throw e;
//         return [() => {
//             return (Dusk.configuration.suspense.renderLoading);
//         }];
//         // throw e;
//     }
//     return [res.default, res];
// }
//
// function normalizeDotRule(searchValue: string, replaceValue = '/'): string {
//     return searchValue.replace(/\./g, replaceValue);
// }
//
// export function DynamicComponent(props: DynamicComponentProps) {
//     const [Component] = useDynamicComponent(props);
//     return (<Component {...props.props} />);
// }
