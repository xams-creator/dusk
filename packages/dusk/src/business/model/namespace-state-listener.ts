import { Store } from 'redux';
import { DuskApplication } from '../../types';
import { APP_HOOKS_ON_SUBSCRIBE } from '../plugin/common';
import { DuskModel } from './types';
import { logger } from '../../index';

export default function namespaceStateListener(
    app: DuskApplication,
    store: Store,
    namespace: string,
    compare = function(a, b) {
        return a == b;
    },
) {
    let currentValue = store.getState()[namespace];
    return () => {
        let newValue = store.getState()[namespace];
        if (!compare(currentValue, newValue)) {
            let oldValue = currentValue;
            currentValue = newValue;
            const model: DuskModel = app.models[namespace];
            // app.emit(APP_HOOKS_ON_SUBSCRIBE, namespace, oldValue, newValue, store, app.models[namespace]);
            if (model.onStateChange) {
                logger.info(`namespace: [${namespace}],`, `value:`, oldValue, ' => ', newValue);
                model.onStateChange.apply(null, [oldValue, newValue, model, app]);
            }
        }
    };
}
