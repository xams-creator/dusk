import React from 'react';
import { DuskApplication } from '../../types';

export class EventWrapper extends React.Component<{
    ctx: DuskApplication,
    children: React.ReactNode
    onLaunch: () => void
    onUnmount: () => void
    onError: (error: Error, errorInfo: React.ErrorInfo) => void
}, any> {

    componentDidMount() {
        this.props.onLaunch();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    // componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    //     this.props.onError(error, errorInfo);
    // }

    render() {
        return this.props.children;
    }

}
