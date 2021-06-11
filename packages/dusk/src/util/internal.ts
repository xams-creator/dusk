import {INITIAL_DATA, Model, NAMESPACE, NAMESPACE_SEPARATOR} from '../index';

export function convertReduxAction({type, effect, ...payload}: any, model: Model | any = {}) {
    const namespace = type.substring(0, type.lastIndexOf(NAMESPACE_SEPARATOR));
    const name = type.substring(type.lastIndexOf(NAMESPACE_SEPARATOR) + 1, type.length);
    // const model = m || {};
    return {
        namespace: namespace,   // dispatch action 的 namespace
        type,
        effect: !!effect,       // 是否副作用函数
        name,          // 方法名,或者说执行的动作
        payload: payload,   // 排除 type, effect 参数的数据


        scoped: namespace === model.namespace,  // 是否和执行reducer的是同一个scope

    };
}


export function query(container) {
    if (typeof container === 'string') {
        const selected = document.querySelector(container);
        if (!selected) {
            return null;
        }
        return selected;
    }
    return container;
}


// export function parseModel(model) {
//     return {
//         origin: key,
//         parsed: key && key.replace(':', ''),
//         global: key && key.indexOf(':') === 0,
//     };
// }

export function normalizationNamespace(namespace) {
    if (namespace[namespace.length - 1] === NAMESPACE_SEPARATOR) {
        return namespace.substring(0, namespace.lastIndexOf(NAMESPACE_SEPARATOR));
    }
    return namespace;
}


export function defaultValue(value, defValue?) {
    return value || defValue || {};
}

export function lock(obj, key) {
    Object.defineProperty(obj, key, {
        writable: false,
        configurable: false,
    });
}
