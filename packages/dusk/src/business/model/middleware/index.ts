import { DuskApplication } from '../../../types';
import { Store } from 'redux';
import { isPlainObject } from '../../../common';
import { APP_HOOKS_ON_POST_EFFECT_ACTION, APP_HOOKS_ON_PRE_EFFECT_ACTION } from '../../plugin/common';
import { convertReduxAction } from '../util';


// Dusk.configuration.plugin.hooks.push(APP_HOOKS_ON_PRE_EFFECT_ACTION, APP_HOOKS_ON_POST_EFFECT_ACTION);

// declare module '../../../index' {
//     interface Plugin {
//         onPreEffectAction?: (ctx: PluginHookContext, next: Function, action: DuskAction) => void;
//         onPostEffectAction?: (ctx: PluginHookContext, next: Function, action: DuskAction) => void;
//     }
// }

export function createEffectActionMiddleware(ctx: DuskApplication) {
    return (store: Store) => next => action => {
        if (action && isPlainObject(action)) {
            const effectAction = convertReduxAction(action);
            const { namespace, name, effect, type } = effectAction;
            if (effect) {
                const model = ctx.models[namespace];
                if (model) {
                    const method = model.effects?.[name];
                    if (method) {
                        const dispatch = store.dispatch;
                        const getState = store.getState;

                        return next(async () => {
                            ctx.emit(APP_HOOKS_ON_PRE_EFFECT_ACTION, effectAction);
                            await method.apply(null, [dispatch, getState()[namespace], effectAction,
                                {
                                    getState, app: ctx,
                                    put: (payload?) => {
                                        dispatch({ type, payload });
                                    },
                                    putIfPending: (payload?) => {
                                        dispatch({
                                            type: `${type}.pending`,
                                            payload,
                                        });
                                    },
                                    putIfFulfilled: (payload?) => {
                                        dispatch({
                                            type: `${type}.fulfilled`,
                                            payload,
                                        });
                                    },
                                    putIfRejected: (payload?) => {
                                        dispatch({
                                            type: `${type}.rejected`,
                                            payload,
                                        });
                                    },
                                },
                            ]);
                            ctx.emit(APP_HOOKS_ON_POST_EFFECT_ACTION, effectAction);
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
