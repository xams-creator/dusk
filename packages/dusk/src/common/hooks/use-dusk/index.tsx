import * as React from 'react';

import { DuskApplication } from '../../../types';
import { DuskContext } from '../../context';

/**
 * 在函数组件中使用dusk
 *
 * @public
 */
export function useDusk(): DuskApplication {
    return React.useContext(DuskContext);
}
