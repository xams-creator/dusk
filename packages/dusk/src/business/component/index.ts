import { normalizeDotRule } from './common/util';
import AbstractManager from '../manager';
import { ComponentOptions, DynamicComponentProps } from './types';
import { useDusk } from '../../common';
import Dusk from '../../index';


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


export function useDynamicComponent(props: DynamicComponentProps) {
    const app = useDusk();
    const id = normalizeDotRule(props.id || props.typeId);
    let res;
    try {
        res = app._cm.components[id];
        if (!res) {
            // @ts-ignore
            res = require(`${(process.env.REACT_APP_PATH_SRC_ALIAS_NAME || 'src')}/${id}`);
            // const v = import(`@/${id}`)
        }
    } catch (e) {
        app.$logger.warn(`${e}, will use Dusk.configuration.suspense.renderLoading`);
        // throw e;
        return [() => {
            return (Dusk.configuration.suspense.renderLoading);
        }];
        // throw e;
    }
    return [res.default, res];
}


