import * as React from 'react';
import { renderRoutes, RouteConfig } from 'react-router-config';
import { SwitchProps } from 'react-router-dom';
import Dusk from '../index';

export type IRouterView = {
    routes: RouteConfig[] | undefined;
    extraProps?: any;
    switchProps?: SwitchProps;

    suspense?: {
        fallback: NonNullable<React.ReactNode> | null;
    };
}

export function RouterView({ routes, extraProps, switchProps, suspense }: IRouterView) {
    return (
        <React.Suspense
            fallback={suspense?.fallback || Dusk.configuration.suspense.fallback}
            children={renderRoutes(routes, extraProps, switchProps)}
        />
    );
}
