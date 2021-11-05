import * as React from 'react';
import { bindActionCreators } from 'redux';
import hoistStatics from 'hoist-non-react-statics';

import { normalizationNamespace } from '../util/internal';
import { useSelector } from 'react-redux';

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


export const withActions = (namespace, options?) => (Component) => (props) => {
    // const displayName = `withDusk(${Component.displayName || Component.name})`;
    // if (model) {
    const app = useDusk();
    const model = app._models[normalizationNamespace(namespace)];
    if (model) {
        if (!Component.WrappedComponent.prototype.actions) {
            Component.WrappedComponent.prototype.actions = bindActionCreators(model.actions, app._store.dispatch);
            Component.WrappedComponent.prototype.methods1 = bindActionCreators(model.methods, app._store.dispatch);
            Component.WrappedComponent.prototype.methods2 = model.methods;
        }
    }
    return <Component {...props} />;
};

export function useDusk() {
    return React.useContext(DuskContext);
}

export function useAxios() {
    return useDusk().$axios;
}

export function useNamespacedSelector(namespace) {
    return useSelector(state => state[normalizationNamespace(namespace)]);
}
