export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    });
}

export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

export function isFunction(fn) {
    return typeof fn === 'function';
}

export function isArray(obj) {
    return Array.isArray(obj);
}

export function isEmpty(value) {
    return !value || value.length === 0;
}

// 下划线转换驼峰
export function toHump(name: string) {
    return name.replace(/_(\w)/g, function(all: any, letter: any) {
        return letter.toUpperCase();
    });
}

// 驼峰转换下划线
export function toLine(name: string) {
    return name.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function identity(_) {
    return _;
}

export function noop(a, b, c) {

}

export function no() {
    return false;
}

// compose middleware
export const simpleCompose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));


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

export function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}


export const arrayMoveMutate = (array, from, to) => {
    const startIndex = from < 0 ? array.length + from : from;

    if (startIndex >= 0 && startIndex < array.length) {
        const endIndex = to < 0 ? array.length + to : to;

        const [item] = array.splice(from, 1);
        array.splice(endIndex, 0, item);
    }
};

export const arrayMove = (array, from, to) => {
    array = [...array];
    arrayMoveMutate(array, from, to);
    return array;
};

export function debounce(fn, time = 0) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            // @ts-ignore
            fn.apply(this, arguments);
        }, time);
    };
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

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop,
};

export function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key];
    };
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val;
    };
    // @ts-ignore
    Object.defineProperty(target, key, sharedPropertyDefinition);
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
