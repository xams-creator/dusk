import * as React from 'react';
import { bindActionCreators } from 'redux';
import hoistStatics from 'hoist-non-react-statics';

import { normalizationNamespace } from '../business/model';
import { useSelector } from 'react-redux';
import Dusk, { DuskApplication, logger } from '../index';

export const DuskContext = React.createContext(null);

export function withDusk(Component) {
    const displayName = `withDusk(${Component.displayName || Component.name})`;
    const C = props => {
        const { wrappedComponentRef, ...remainingProps } = props;

        return (
            <DuskContext.Consumer>
                {context => {
                    return (<Component{...remainingProps} $app={context} ref={wrappedComponentRef} />);
                }}
            </DuskContext.Consumer>
        );
    };

    C.displayName = displayName;
    C.WrappedComponent = Component;
    return hoistStatics(C, Component);
}

// export const withDuskActions = (namespace, options?) => (Component) => {
//     const displayName = `withDuskActions(${Component.displayName || Component.name})`;
//     const C = props => {
//         const app = useDusk();
//         const model = app._models[normalizationNamespace(namespace)];
//         if (model) {
//             if (!Component.WrappedComponent.prototype.actions) {
//                 Component.WrappedComponent.prototype.actions = bindActionCreators(model.actions, app._store.dispatch);
//             }
//         }
//         const { wrappedComponentRef, ...remainingProps } = props;
//         return (<Component{...remainingProps} ref={wrappedComponentRef} />);
//     };
//     C.displayName = displayName;
//     C.WrappedComponent = Component;
//     return hoistStatics(C, Component);
// };

//
// export const withActions = (namespace, options?) => (Component) => (props) => {
//     // const displayName = `withDusk(${Component.displayName || Component.name})`;
//     // if (model) {
//     const app = useDusk();
//     const model = app.models[normalizationNamespace(namespace)];
//     if (model) {
//         if (!Component.WrappedComponent.prototype.actions) {
//             Component.WrappedComponent.prototype.actions = bindActionCreators(model.actions, app.$store.dispatch);
//             Component.WrappedComponent.prototype.methods1 = bindActionCreators(model.methods, app.$store.dispatch);
//             Component.WrappedComponent.prototype.methods2 = model.methods;
//         }
//     }
//     return <Component {...props} />;
// };

export function useDusk(): DuskApplication {
    return React.useContext(DuskContext);
}

export function useAxios() {
    return useDusk().$axios;
}

export function useNamespacedSelector(namespace) {
    const model = useDusk().models[namespace];
    return useSelector((state: ReturnType<typeof model.initialState>) => {
        return state[normalizationNamespace(namespace)];
    });
}

export interface DynamicComponentProps {
    id: string;
    tid?: string;
    props?: any;
}

//
// export function useDynamicComponent(options: DynamicComponentProps) {
//     const app: Index = useDusk();
//     const id = normalizeDotRule(options.id || options.tid);
//     let res;
//     try {
//         res = app._cm.get(id);
//         if (!res) {
//             // @ts-ignore
//             res = require(`${process.env.REACT_APP_PATH_SRC_ALIAS_NAME}/${id}`);
//             // const v = import(`@/${id}`)
//         }
//     } catch (e) {
//         logger.warn(`${e}, will use Dusk.configuration.suspense.renderLoading`);
//         // throw e;
//         return [() => {
//             return (Index.configuration.suspense.renderLoading);
//         }];
//         // throw e;
//     }
//     return [res.default, res];
// }
//
//
// export function DynamicComponent(options: DynamicComponentProps) {
//     const [Component] = useDynamicComponent(options);
//     return (<Component {...options.props} />);
// }

// /**
//  *  app.
//  *
//  * */
// export function useEvaluation(key: string, options: { fields: any } = { fields: {} }) {
//
//
// }
