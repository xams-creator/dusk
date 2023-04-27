import { DynamicComponentProps } from '../../../business';
import { useDusk } from '../use-dusk';
import { normalizeDotRule } from '../../../business/component/common/util';
import Dusk from '../../../index';

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

