import React, { useMemo } from 'react';

import { proxy } from '@xams-framework/common';
import { useCreation, useReactive } from 'ahooks';

type State = Record<string, any>;
type Methods<S, M> = Partial<Record<string, (this: ViewModel<S, M>, ...args: any[]) => any>>;
type ViewModelState<S> = { [K in keyof S]: S[K] };
type ViewModelMethods<M> = { [MT in keyof M]: M[MT] };
type ViewModel<S, M> = ViewModelState<S> & ViewModelMethods<M>;

interface ViewModelOptions<S, M> {
    state: S;
    methods: M;
}

export default function useViewModel<S extends State, M extends Methods<S, M>>(
    options: ViewModelOptions<S, M>
): ViewModel<S, M> {
    const state = useReactive<S>(options.state);
    const methods = useMemo(() => {
        return options.methods || {};
    }, [options.methods]);

    const vm = useCreation(() => {
        const vm = {
            $state: state,
            $methods: methods,
            ...state,
            ...methods,
        };
        for (const key in methods) {
            // @ts-ignore
            methods[key] = methods[key].bind(vm);
            proxy(vm, '$methods', key);
        }

        for (const key in state) {
            proxy(vm, '$state', key);
        }
        return vm;
        // return new Proxy(vm, {
        //     get(target: ViewModelState<S> & ViewModelMethods<M>, key: string | symbol, receiver: any): any {
        //         return Reflect.get(target, key, receiver);
        //     },
        //     set(target: ViewModelState<S> & ViewModelMethods<M>, key: string | symbol, val: any, receiver: any): boolean {
        //         return Reflect.set(target, key, val);
        //     },
        // });
    }, [state, methods]);

    return vm;
}

export function TestViewModel() {
    // const vm = useViewModel({
    //     state: {
    //         count: 1,
    //     },
    //     methods: {
    //         add(a: number) {
    //             this.count += 1;
    //             this.add(1);
    //         },
    //     },
    // });

    const vm = useViewModel({
        state: {
            count: 0,
        },
        methods: {
            add(v: number) {},
        },
    });

    // window.vm = vm;
    return <button onClick={() => vm.add(1)}> {vm.count}</button>;
}
