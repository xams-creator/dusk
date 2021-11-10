import React, { useState } from 'react';
import { container } from '@xams-framework/dusk';

/*
    内部使用 @container 快捷注入组件
    第三方包使用 plugin onReady + app.component 注入组件
    最终通过 DynamicComponent 实现引入组件,为 dusk-example-admin 动态模板页面 提供了帮助
**/

@container('pages/container/a')
export class ContainerA extends React.Component<any, any> {

    render() {
        return (
            <div>容器测试A</div>
        );
    }
}

@container('pages/container/b')
export class ContainerB extends React.Component<any, any> {

    render() {
        return (
            <div>容器测试B</div>
        );
    }
}

@container('pages/container/c')
export class ContainerC extends React.Component<any, any> {

    render() {
        return (
            <InternalContainerC />
        );
    }
}

const InternalContainerC: React.FC<any> = (props) => {
    const [visible, setVisible] = useState(true);
    const handleOnMouseOver = () => {
        setVisible(false);
    };
    const handleOnMouseLeave = () => {
        setVisible(true);
    };
    return (
        <div
            onMouseOver={handleOnMouseOver}
            onMouseLeave={handleOnMouseLeave}
        >
            {
                visible && <><input type={'checkbox'} name='vehicle' value='Bike' />可远观不可亵玩</>
            }
            <br />
            容器测试C
        </div>
    );
};
