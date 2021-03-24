export default {
    namespace: 'app2',
    state: {
        count: 0
    },
    initialData: {
        step: 2,
    },
    reducers: {
        add(state, data) {
            console.log(this);
            return {
                ...state,
                count: state.count + data.step
            };
        },
        minus(state, data) {
            console.log(data);
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
                dispatch({type: 'app/minus', step: value});
            };
        },

        add2(value) {

        }


    }
};

