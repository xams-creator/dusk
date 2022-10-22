import React from 'react';


export interface ButtonProps {
    type?: 'danger' | 'normal';
    label: string;
    className?: string;
}


const InternalButton: React.ForwardRefRenderFunction<unknown, ButtonProps> = (props, ref) => {
    const { label } = props;
    return (
        <button>{label}</button>
    );
};

const Button = React.forwardRef<unknown, ButtonProps>(InternalButton);
Button.displayName = 'Button';

export default Button;
