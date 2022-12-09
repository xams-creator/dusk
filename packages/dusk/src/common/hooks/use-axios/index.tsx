import * as React from 'react';
import { useDusk } from '../use-dusk';

/**
 * 在函数组件中使用dusk axios 实例
 *
 * @experimental
 */
export function useAxios() {
    return useDusk().$axios;
}
