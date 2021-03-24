
export class App1Model {
    static namespace = 'app';

    static state = {
        count: 0
    };

    static initialData = {
        step: 2,
    };

    static reducers = {
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
    };

    static actions = {
        add(dispatch) {
            dispatch({type: 'app/add'});
        },

        minus(dispatch) {
            dispatch({type: 'app/minus', step: 100});
        }

    };


}

window.App1Model = App1Model;

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

/**
 *   todo
 *   1.add : this 为当前组件，minus this 为 actions，哪种好
 *
 *
 *
 *
 *
 * **/
