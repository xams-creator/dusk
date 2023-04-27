import { PluginFunction } from '../../business';
import { DuskReduxOptions } from '../../types';
import {
    applyMiddleware,
    compose,
    legacy_createStore as createStore,
} from 'redux';
import { identity, isProduction } from '../../common';
import thunk from 'redux-thunk';
import Dusk from '../../index';
import { createLogger } from 'redux-logger';
import { reduxBatch } from '@manaflair/redux-batch';
import { devToolsEnhancer } from '@redux-devtools/extension';
import { createEffectActionMiddleware } from '../../business/model/middleware';


export function createDuskInternalRedux(redux: DuskReduxOptions = {}): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-redux',
            setup() {
                const middlewares = [
                    createEffectActionMiddleware(app),
                    thunk.withExtraArgument(app),
                    !Dusk.configuration.silent && createLogger(redux.logger),
                ].concat(redux.middlewares || []).filter(Boolean);

                const middlewareEnhancer = applyMiddleware(...middlewares);
                const enhancers = [middlewareEnhancer, ...[
                    reduxBatch,
                ], ...(redux.enhancers || [])];

                if (redux.devTools) {
                    enhancers.push(devToolsEnhancer({
                        trace: !isProduction(),
                        ...(typeof redux.devTools === 'object' && redux.devTools),
                    }));
                }
                app.$store = createStore(identity, redux.preloadedState, compose(...enhancers));
            },
        };
    };
}

