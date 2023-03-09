export function isFunction(fn) {
    return typeof fn === 'function';
}

export function isEmpty(value) {
    return !value || value.length === 0;
}

export function identity(_) {
    return _;
}

export function noop(a, b, c) {

}

export function no() {
    return false;
}

export function inBrowser() {
    return typeof window !== 'undefined';
}

const _toString = Object.prototype.toString;

export function isPlainObject(obj) {
    return _toString.call(obj) === '[object Object]';
}

export function toString(val) {
    return val == null
        ? ''
        : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
            ? JSON.stringify(val, null, 2)
            : String(val);
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

export function lock(obj, key) {
    Object.defineProperty(obj, key, {
        writable: false,
        configurable: false,
    });
}

export function readOnly(obj, key, value) {
    Object.defineProperty(obj, key, {
        get() {
            return value;
        },
        set() {
            throw new Error('Do not replace the value.');
        },
    });
}

export function isProduction() {
    // @ts-ignore
    return process.env.NODE_ENV === 'production';
}

export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}


/**
 * 检查数组中是否存在此值，如果存在，返回其下标，不存在返回 -1
 *
 * looseIndexOf([1,2,3],2)  // 1
 * looseIndexOf([1,2,3],111)  // -1
 */
export function looseIndexOf(arr, val) {
    for (let i = 0; i < arr.length; i++) {
        if (looseEqual(arr[i], val)) {
            return i;
        }
    }
    return -1;
}

export function looseEqual(a, b) {
    if (a === b) {
        return true;
    }
    let isObjectA = isObject(a);
    let isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
        try {
            let isArrayA = Array.isArray(a);
            let isArrayB = Array.isArray(b);
            if (isArrayA && isArrayB) {
                return a.length === b.length && a.every(function(e, i) {
                    return looseEqual(e, b[i]);
                });
            } else if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime();
            } else if (!isArrayA && !isArrayB) {
                let keysA = Object.keys(a);
                let keysB = Object.keys(b);
                return keysA.length === keysB.length && keysA.every(function(key) {
                    return looseEqual(a[key], b[key]);
                });
            } else {
                /* istanbul ignore next */
                return false;
            }
        } catch (e) {
            /* istanbul ignore next */
            return false;
        }
    } else if (!isObjectA && !isObjectB) {
        return String(a) === String(b);
    } else {
        return false;
    }
}
