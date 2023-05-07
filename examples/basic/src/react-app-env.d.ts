//// <reference types="react-scripts" />
import { Location } from '@remix-run/router';
import { PluginHookContext } from '@xams-framework/dusk';

declare module '@xams-framework/dusk' {
    interface Plugin {
        onRouteBefore?: (ctx: PluginHookContext, next: Function, prevLocation: Location, nextLocation: Location) => void;
        onRouteAfter?: (ctx: PluginHookContext, next: Function, prevLocation: Location, nextLocation: Location) => void;
    }
}
