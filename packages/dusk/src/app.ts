import Dusk from './index';
import type { DuskApplication, DuskOptions } from './types';

/**
 * @public
 * 创建app的入口，这将利用到typescript的类型检查
 *
 * @example
 ```tsx
 const app = createApp({
    container: '#root',
});
 ```
 */
export default function createApp(options: DuskOptions): DuskApplication {
    return new Dusk(options);
}
