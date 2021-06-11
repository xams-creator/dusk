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
    },
    actions: {
        add(dispatch) {
            dispatch({type: 'app/add'});
        },
        minus(value) {
            return (dispatch) => {
                dispatch([{type: 'app/minus', step: value}]);
            };
        },
        add2(value) {
            return [{type: 'app/add', step: value}, {type: 'app/minus', step: value}];
        }


    }
};


