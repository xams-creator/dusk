import { useSelector } from 'react-redux';

import get from 'lodash.get';

import { isProduction } from '../../util';

/**
 * 根据 model.namespace 获取selector state
 *
 * @public
 */
export function useNamespacedSelector<S = unknown>(namespace: string, path?: string) {
    return useSelector((state): S => {
        if (!state[namespace]) {
            if (!isProduction()) {
                console.warn(`please check namespace: [${namespace}] model status`);
            }
        }
        return path ? get(state[namespace], path) : state[namespace];
    });
}
