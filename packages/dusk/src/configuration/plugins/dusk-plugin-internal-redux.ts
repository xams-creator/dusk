import { reduxBatch } from '@manaflair/redux-batch';
import { devToolsEnhancer } from '@redux-devtools/extension';
import { applyMiddleware, compose, legacy_createStore as createStore, type StoreEnhancer } from 'redux';
import { createLogger } from 'redux-logger';
import { withExtraArgument } from 'redux-thunk';

import { PluginFunction } from '../../business';
import { createEffectActionMiddleware } from '../../business/model/middleware';
import { identity, isProduction } from '../../common';
import Dusk from '../../index';
import { DuskReduxOptions } from '../../types';

export function createDuskInternalRedux(redux: DuskReduxOptions = {}): PluginFunction {
    return app => {
        return {
            name: 'dusk-plugin-internal-redux',
            setup() {
                const middlewares = [
                    createEffectActionMiddleware(app),
                    withExtraArgument(app),
                    !Dusk.configuration.silent && createLogger(redux.logger),
                ]
                    .concat(redux.middlewares || [])
                    .filter(Boolean);

                const middlewareEnhancer = applyMiddleware(...middlewares);
                const enhancers = [middlewareEnhancer, ...[reduxBatch], ...(redux.enhancers || [])];

                if (redux.devTools) {
                    enhancers.push(
                        devToolsEnhancer({
                            trace: !isProduction(),
                            ...(typeof redux.devTools === 'object' && redux.devTools),
                        }) as StoreEnhancer,
                    );
                }
                app.$store = createStore(identity, redux.preloadedState, compose(...enhancers));
            },
        };
    };
}
