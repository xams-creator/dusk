import { Store } from 'redux';

import { DuskApplication } from '../../types';
import { APP_HOOKS_ON_STATE_CHANGE } from '../plugin/common';
import { DuskModel } from './types';

export default function namespaceStateListener(
    app: DuskApplication,
    model: DuskModel,
    store: Store,
    compare = function (a, b) {
        return a == b;
    }
) {
    const namespace = model.namespace;
    let currentValue = store.getState()[namespace];
    return () => {
        let newValue = store.getState()[namespace];
        if (!compare(currentValue, newValue)) {
            let oldValue = currentValue;
            currentValue = newValue;
            model.onStateChange && model.onStateChange.apply(null, [oldValue, newValue, model, app]);
            app.emit(APP_HOOKS_ON_STATE_CHANGE, oldValue, newValue, model, app);
        }
    };
}
