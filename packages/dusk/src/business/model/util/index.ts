/**
 * 创建app的入口，这将利用到typescript的类型检查
 * normalizationNamespace('//app//') === 'app'
 * @internal
 */
import { NAMESPACE_SEPARATOR } from '../common';
import { DuskAction, DuskModel } from '../types';
import { lock } from '../../../common';
import { ModelDefinition } from '../index';

export function normalizationNamespace(namespace: string) {
    return namespace;
    // if (namespace[namespace.length - 1] === NAMESPACE_SEPARATOR) {
    //     return namespace.substring(0, namespace.lastIndexOf(NAMESPACE_SEPARATOR));
    // }
    // return namespace.replace(/\//g, '');
}

export function getType(namespace: string, name: string) {
    return `${namespace}${NAMESPACE_SEPARATOR}${name}`;
}


export function lockDuskModel(model: DuskModel, keys: string[]) {
    keys.forEach((key) => {
        lock(model, key);
    });
}



export function convertReduxAction({ type, effect, payload, ...rest }: any, model?: ModelDefinition): DuskAction {
    const namespace = type.substring(0, type.lastIndexOf(NAMESPACE_SEPARATOR));
    const name = type.substring(type.lastIndexOf(NAMESPACE_SEPARATOR) + 1, type.length);
    // const model = m || {};
    return {
        type,
        namespace,   // dispatch action 的 namespace
        name,          // 方法名,或者说执行的动作
        payload,   // 排除 type, effect 参数的数据
        effect: !!effect,       // 是否副作用函数
        scoped: namespace === model?.namespace,  // 是否和执行reducer的是同一个scope
        ...rest,
    };
}
