import Dusk from './index';
import type { DuskApplication, DuskOptions } from './types';

export function createApp(options: DuskOptions): DuskApplication {
    return new Dusk(options);
}
