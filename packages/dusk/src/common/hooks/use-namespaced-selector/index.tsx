import { useSelector } from 'react-redux';
import get from 'lodash.get';
import { isDevelopment } from '../../util/node-env';

/**
 * 根据 model.namespace 获取selector state
 *
 * @public
 */
export function useNamespacedSelector<S = unknown>(namespace: string, path?: string) {
    return useSelector(
        (state): S => {
            if (!state[namespace] && isDevelopment()) {
                console.warn(`please check namespace: [${namespace}] status`);
            }
            return path ? get(state[namespace], path) : state[namespace];
        },
    );
}
