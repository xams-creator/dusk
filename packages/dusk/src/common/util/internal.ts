import { NAMESPACE_SEPARATOR } from '../index';


export function supportHMR() {
    // @ts-ignore
    if (module.hot) {
        // @ts-ignore
        if (module.hot.status() === 'idle') {
            return true;
        }
    }
    return false;
}


// export function parseModel(model) {
//     return {
//         origin: key,
//         parsed: key && key.replace(':', ''),
//         global: key && key.indexOf(':') === 0,
//     };
// }


export function defaultValue(value, defValue?) {
    return value || defValue || {};
}

