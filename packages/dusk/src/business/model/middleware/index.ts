import { Store, isPlainObject } from 'redux';

import { DuskApplication } from '../../../types';
import { APP_HOOKS_ON_POST_EFFECT_ACTION, APP_HOOKS_ON_PRE_EFFECT_ACTION } from '../../plugin/common';
import { convertReduxAction } from '../common/util';
import { DuskEffectPayloadAction } from '../types';

// Dusk.configuration.plugin.hooks.push(APP_HOOKS_ON_PRE_EFFECT_ACTION, APP_HOOKS_ON_POST_EFFECT_ACTION);

// declare module '../../../index' {
//     interface Plugin {
//         onPreEffectAction?: (ctx: PluginHookContext, next: Function, action: DuskAction) => void;
//         onPostEffectAction?: (ctx: PluginHookContext, next: Function, action: DuskAction) => void;
//     }
// }

// function put(dispatch, { type }: DuskPayloadAction, app: DuskApplication) {
//     return (payload?) => {
//         return dispatch({
//             type: type,
//             payload,
//         });
//     };
// }

export function createEffectActionMiddleware(ctx: DuskApplication) {
    return (store: Store) => next => action => {
        if (action && isPlainObject(action)) {
            const effectAction = convertReduxAction(action);
            const { namespace, name, effect, type, scoped } = effectAction;
            if (effect) {
                const model = ctx._mm.get(namespace);
                if (model) {
                    const method = model.effects?.[name];
                    if (method) {
                        const dispatch = store.dispatch;
                        const getState = store.getState;

                        return next(async () => {
                            ctx.emit(APP_HOOKS_ON_PRE_EFFECT_ACTION, effectAction);
                            try {
                                return await method(
                                    dispatch,
                                    getState()[namespace],
                                    effectAction as DuskEffectPayloadAction,
                                    {
                                        model,
                                        getState,
                                        app: ctx,
                                        // @ts-ignore
                                        put(payload?) {
                                            return dispatch({
                                                ...effectAction,
                                                effect: false,
                                                payload,
                                            });
                                        },
                                        set(fn) {
                                            return dispatch({
                                                ...effectAction,
                                                effect: false,
                                                payload: fn,
                                                type: `${namespace}/`,
                                                name: '',
                                            });
                                        },
                                        async sleep(time) {
                                            return await new Promise(resolve => {
                                                setTimeout(() => {
                                                    resolve(true);
                                                }, time || 0);
                                            });
                                        },
                                    },
                                );
                            } finally {
                                ctx.emit(APP_HOOKS_ON_POST_EFFECT_ACTION, effectAction);
                            }
                        });
                        // return next(method);
                        // action(dispatch, getState, extraArgument);;
                    }
                }
            }
        }
        return next(action);
    };
}

// await method.apply(null, [dispatch, getState()[namespace], effectAction,
//     {
//         getState, app: ctx,
//
//         sleep: async (time) => {
//             await new Promise((resolve) => {
//                 setTimeout(() => {
//                     resolve(true);
//                 }, time || 0);
//             });
//         },
//         putIfPending: (payload?) => {
//             dispatch({
//                 type: `${type}.pending`,
//                 payload,
//             });
//         },
//         putIfFulfilled:
//             (payload?) => {
//                 dispatch({
//                     type: `${type}.fulfilled`,
//                     payload,
//                 });
//             },
//         putIfRejected: (payload?) => {
//             dispatch({
//                 type: `${type}.rejected`,
//                 payload,
//             });
//         },
//     },
// ]);
