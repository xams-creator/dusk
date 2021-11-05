import React from 'react';
import { define, route } from '@xams-framework/dusk/annotation';
import model from '@/business/pages/model/index.model';
import { connect } from '@xams-framework/dusk';

/*
   todo? : 注解名字增加一个 @model，@define似乎不太具体

**/

@define(model)
@route({
    path: '/model',
}, connect((state) => {
    return state['model'];
}))
export default class Model extends React.Component<{ dispatch, value: number }, any> {


    render() {
        window.model = this;
        const dispatch = this.props.dispatch;
        return (
            <div>
                <h2>model</h2>
                <button onClick={() => dispatch({ type: 'model/add' })}>+</button>
                ---
                <button onClick={() => dispatch({ type: 'model/minus' })}>-</button>
                {this.props.value}
            </div>
        );
    }

}