export default {
    namespace: 'app',
    state: {
        count: 0
    },
    initialData: {
        step: 2,
    },
    reducers: {
        add(state, data) {
            return {
                ...state,
                count: state.count + data.step
            };
        },
        minus(state, data) {
            return {
                ...state,
                count: state.count - data.step
            };
        },
    }
};


