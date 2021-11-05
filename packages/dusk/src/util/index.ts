export function defaultValue(value, defValue, fnArgs?) {
    if (value) {
        return isFunction(value) ? value(fnArgs) : value;
    }
    if (defValue) {
        return isFunction(defValue) ? defValue(fnArgs) : defValue;
    }
}

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

export function identity(_) {
    return _;
}

export function noop(a, b, c) {

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


export function getTree<T>(json: Array<T>, id: string | number, parent: string | number, children: string | number): Array<T> {
    const result: Array<T> = [];
    const temp: Array<T> = [];
    json.map((item: any) => {
        temp[item[id]] = item;
        return null;
    });
    json.map((item: T) => {
        const currentElement: any = item;
        const tempCurrentElementParent: any = temp[currentElement[parent]];
        if (tempCurrentElementParent) {
            if (!tempCurrentElementParent[children]) { // 如果父元素没有chindren键
                tempCurrentElementParent[children] = []; // 设上父元素的children键
            }
            tempCurrentElementParent[children].push(currentElement); // 给父元素加上当前元素作为子元素
        } else {
            result.push(currentElement);
        }
        return null;
    });
    return result;
}

export function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

const SimpleQueryEngine = function(query: any, options: any): any {
    switch (typeof query) {
        default:
            throw new Error('Can not query with a ' + typeof query);
        case 'object':
        case 'undefined':
            const queryObject: any = query;
            query = (object: any) => {
                for (const key in queryObject) {
                    const required = queryObject[key];
                    if (required && required.test) {
                        // an object can provide a test method, which makes it work with regex
                        if (!required.test(object[key], object)) {
                            return false;
                        }
                    } else if (required != object[key]) {
                        return false;
                    }
                }
                return true;
            };
            break;
        case 'string':
            // named query
            // @ts-ignore
            if (!this[query]) {
                // console.log(this);
                throw new Error('No filter function ' + query + ' was found in store');
            }
            // @ts-ignore
            query = this[query];
            // fall through
            break;
        case 'function':
            break;
        // fall through
    }

    function execute(array: any) {
        // execute the whole query, first we filter
        let results: any = array.filter(query);
        // next we sort
        const sortSet = options && options.sort;
        if (sortSet) {
            results.sort(typeof sortSet == 'function' ? sortSet : function(a: any, b: any) {
                for (const sort of sortSet) {
                    let aValue = a[sort.attribute];
                    let bValue = b[sort.attribute];
                    // valueOf enables proper comparison of dates
                    aValue = aValue != null ? aValue.valueOf() : aValue;
                    bValue = bValue != null ? bValue.valueOf() : bValue;
                    if (aValue != bValue) {
                        return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
                    }
                }
                return 0;
            });
        }
        // now we paginate
        if (options && (options.offset || options.count)) {
            const total = results.length;
            results = results.slice(options.offset || 0, (options.offset || 0) + (options.count || Infinity));
            results.total = total;
        }
        return results;
    }

    // @ts-ignore
    execute.matches = query;
    return execute;

};

export class Memory<T = any> {

    idProperty: string;
    data: T[] = [];
    index: object = {};

    queryEngine: Function;

    constructor(data: Array<T>, idProperty: string = 'id') {
        this.idProperty = idProperty;
        this.queryEngine = SimpleQueryEngine.bind(this);
        this.setData(data || []);
    }

    get(id: string | number): T {
        return this.data[this.index[id]];
    }


    getIdentity(item: T): string | number {
        return item[this.idProperty];
    }

    add(item: T, options: any = {}): string | number {
        (options = options || {}).overwrite = false;
        return this.put(item, options);
    }

    put(item: T, options: any = {}): string | number {
        const { data, index, idProperty } = this;
        const id = item[idProperty] = (options && 'id' in options) ? options.id : idProperty in item ? item[idProperty] : Math.random();
        if (id in index) {
            if (options && options.overwrite === false) {
                throw new Error('Object already exists');
            }
            data[index[id]] = item;
        } else {
            index[id] = data.push(item) - 1;
        }
        return id;
    }


    setData(data: Array<T>) {
        this.data = data;
        this.index = {};
        data.forEach((item: T, index: number) => {
            this.index[item[this.idProperty]] = index;
        });
    }

    remove(id: string | number): boolean {
        const { data, index, idProperty } = this;
        if (id in index) {
            data.splice(index[id], 1);
            // now we have to reindex
            this.setData(data);
            return true;
        }
        return false;
    }

    query(query: any = {}, options: any = {}) {
        return this.queryEngine(query, options)(this.data);
    }

}

export function hitchActions(actions, context) {
    if (typeof actions === 'function') {
        return actions.bind(context);
    }
    if (typeof actions !== 'object' || actions === null) {
        throw new Error('类型错误无法绑定');
    }
    let boundActions = {};
    for (let key in actions) {
        let action = actions[key];
        if (typeof action === 'function') {
            boundActions[key] = action.bind(context);
        }
    }
    return boundActions;
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

export function debounce(fn, time?) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, arguments);
        }, time || 0);
    };
}
