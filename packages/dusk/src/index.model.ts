export default {
    namespace: '@@xams',
    state: {
        def: 0
    },
    scoped: {
        reducers: {
            def(state, {model}) {
                console.log(model);
                // setTimeout(() => {
                //     it.define(model);
                // });
                return {
                    ...state,
                    def: state.def + 1
                };
            },
            test(state) {
                return {
                    ...state,
                    test: 'ok'
                };
            },
        }
    },
    global: {
        reducers: {
            'global:def'(state) {

            },
            'app/add'(state) {
                return {
                    ...state,
                    act: 'act'
                };
            }
        }
    },

    subscribe(oldValue, newValue) {
        console.log('@@xams值已发生更新', newValue);
    }
};
