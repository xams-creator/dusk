import { normalizeDotRule } from './common/util';
import AbstractManager from '../manager';
import { ComponentOptions } from './types';


export class ComponentManager extends AbstractManager<ComponentOptions> {

    components: {
        [index: string]: ComponentOptions
    };

    initialization(): void {
        this.components = {};
    }

    use(definition: ComponentOptions): void {
        const id = normalizeDotRule(definition.id);
        if (this.components[id]) {
            return;
        }
        this.components[id] = definition;
    }

    dispose(): void {
        // this.components = {};
    }

}


