import { DuskApplication } from '../types';

/**
 * 管理器接口，其实现作为管理dusk某部分核心功能
 * @public
 */
export interface Manager<T> {

    /**
     * new Manager时调用
     * @public
     */
    initialization: () => void;

    use: (definition: T) => void;

    dispose(): void;

}

export default abstract class AbstractManager<T = any> implements Manager<T> {

    ctx: DuskApplication;

    constructor(ctx: DuskApplication) {
        this.ctx = ctx;
        this.initialization();
    }

    abstract initialization(): void

    abstract use(definition: T): void

    abstract dispose(): void

}

// export function createManager(type: 'plugin' | 'model' | 'component' | 'mm1', ctx: DuskApplication): any {
//     switch (type) {
//         case 'plugin':
//             return new PluginManager(ctx);
//         case 'model':
//             return new ModelManager(ctx);
//         case 'mm1':
//             return new ModelManager1(ctx);
//         // case 'component':
//         //     return new ComponentManager(ctx);
//         default:
//             console.error('Unsupported manager type!');
//             return null;
//     }
// }
