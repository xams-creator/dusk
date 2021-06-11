import * as React from 'react';
import {bindActionCreators} from 'redux';
import {NAMESPACE_SEPARATOR} from '../index';
import {normalizationNamespace} from '../util/internal';

export const DuskContext = React.createContext(null);

export const withDusk = (Component) => (props) => {
    // const displayName = `withDusk(${Component.displayName || Component.name})`;
    return (
        <DuskContext.Consumer>
            {(context) => {
                return <Component $app={context} {...props} />;
            }}
        </DuskContext.Consumer>
    );
};

export const withActions = (namespace, options?) => (Component) => (props) => {
    // const displayName = `withDusk(${Component.displayName || Component.name})`;
    // if (model) {
    const app = useDusk();
    const model = app._models[normalizationNamespace(namespace)];
    if (model) {
        if (!Component.WrappedComponent.prototype.actions) {
            Component.WrappedComponent.prototype.actions = bindActionCreators(model.actions, app._store.dispatch);
        }
    }
    return <Component {...props} />;
};

export function useDusk() {
    return React.useContext(DuskContext);
}

export function useAxios() {
    return useDusk()._axios;
}

