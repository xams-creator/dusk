import React from 'react';

type Component<P> =
    | React.ComponentType<P>
    | React.ForwardRefExoticComponent<P>
    | React.FC<P>
    | React.ReactNode
    | keyof React.ReactHTML;

export interface ComponentOptions<P = any> {
    id: string;             // 应用上下文全局唯一id, 不存在时使用 typeId + objectId
    typeId?: string;        // 组件类型id, 描述组件对应的类型
    objectId?: string;       // 组件对象id，一个typeId可能对应多个objectId

    default: any; // Component<P>;        // Component
    props?: P;         // default props
}

export type DynamicComponentProps<P = any> = Omit<ComponentOptions<P>, 'default'>
