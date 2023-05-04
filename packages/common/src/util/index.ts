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


export function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}


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

export function identity(_) {
    return _;
}

export function noop(a, b, c) {

}

export function no() {
    return false;
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


export function isProduction() {
    // @ts-ignore
    return process.env.NODE_ENV === 'production';
}

export function isDevelopment() {
    return !isProduction();
}

export function inWebpack() {
    // @ts-ignore
    return !import.meta.env;
}

export function inVite() {
    return !inWebpack();
}
