import React from 'react';
import { DuskApplication } from './types';

interface EventWrapperProps {
    ctx: DuskApplication,
    children: React.ReactNode
    onLaunch: () => void
    onUnmount: () => void
    // onError: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * 事件包装器,用于触发一些dusk生命周期
 *
 * @internal
 */
export class DuskEventWrapper extends React.Component<EventWrapperProps> {

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

// const InternalDuskEventWrapper: React.ForwardRefRenderFunction<unknown, EventWrapperProps> = (props, ref) => {
//     const {
//         onLaunch, onUnmount,
//     } = props;
//     useEffect(() => {
//         onLaunch?.();
//         return () => {
//             onUnmount?.();
//         };
//     }, []);
//     return props.children;
// };
// export const DuskEventWrapper = React.forwardRef<unknown, EventWrapperProps>(InternalDuskEventWrapper);
// DuskEventWrapper.displayName = 'DuskEventWrapper';
