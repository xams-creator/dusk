import { Model } from '@xams-framework/dusk';

interface State {
    value: number,
}

/*
   todo? : 后续增加类模式model，可以做继承通用化,
            model actions,reducers 增加具体类型
            model内部操作时的帮助方法
            class model 增加 @effect
**/

const model: Model = {
    namespace: 'model',
    state: {
        value: 0,
    },
    scoped: {
        reducers: {
            add(state: State) {
                state.value += 1;
            },
            minus(state: State) {
                state.value -= 1;
            },
        },
    },
    setup(app) {
        console.log('这个model被初始化了，且只会执行一次');
    },
};

export default model;