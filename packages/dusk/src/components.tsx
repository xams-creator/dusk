import React, { isValidElement, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { DuskApplication } from './types';

interface DuskWrapperProps {
    ctx: DuskApplication;
    onMounted: () => void;
    onUnmount: () => void;
    children: ((children: React.ReactNode) => React.ReactNode) | React.ReactNode;
}

/**
 * 事件包装器,用于触发一些dusk生命周期
 *
 * @internal
 */
export class DuskWrapper extends React.Component<DuskWrapperProps, any> {
    componentDidMount() {
        this.props.onMounted();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    // componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    //     this.props.onError(error, errorInfo);
    // }

    render() {
        const app = this.props.ctx;
        const children = this.props.children;

        if (!children) {
            if (!app.$router) {
                return;
            }
            return <RouterProvider router={app.$router} />;
        }

        if (isValidElement(children)) {
            return children;
        }

        return (children as (children) => React.ReactNode)(
            app.$router ? <RouterProvider router={app.$router} /> : null
        );
    }
}
