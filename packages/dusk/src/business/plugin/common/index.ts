export const APP_HOOKS_ON_READY = 'onReady';
export const APP_HOOKS_ON_MOUNTED = 'onMounted';
export const APP_HOOKS_ON_DESTROY = 'onDestroy';


export const APP_HOOKS_ON_DOCUMENT_VISIBLE = 'onDocumentVisible';
export const APP_HOOKS_ON_DOCUMENT_HIDDEN = 'onDocumentHidden';
export const APP_HOOKS_ON_STATE_CHANGE = 'onStateChange';
export const APP_HOOKS_ON_ROUTE_BEFORE = 'onRouteBefore';
export const APP_HOOKS_ON_ROUTE_AFTER = 'onRouteAfter';

export const APP_HOOKS_ON_ERROR = 'onError';

export const APP_HOOKS_ON_PRE_ACTION = 'onPreAction';
export const APP_HOOKS_ON_POST_ACTION_AFTER = 'onPostAction';
export const APP_HOOKS_ON_PRE_EFFECT_ACTION = 'onPreEffectAction';
export const APP_HOOKS_ON_POST_EFFECT_ACTION = 'onPostEffectAction';

export const APP_PLUGIN_HOOKS = [
    APP_HOOKS_ON_READY,   // ReactDom.render 前触发
    APP_HOOKS_ON_MOUNTED, // ReactDom.render 后 callback 触发
    APP_HOOKS_ON_DESTROY, // 销毁时触发
    APP_HOOKS_ON_DOCUMENT_VISIBLE,  // 页面由不可见到可见触发 document.addEventListener("visibilitychange", handleVisibilityChange, false);
    APP_HOOKS_ON_DOCUMENT_HIDDEN,  // 页面由可见到不可见触发 这里有 pageshow 和 pagehide ，参考mdn，发现不推荐用
    APP_HOOKS_ON_STATE_CHANGE, // 当state发生改变时执行
    APP_HOOKS_ON_ERROR, // 当 uncaught error 时执行
    APP_HOOKS_ON_ROUTE_BEFORE,
    APP_HOOKS_ON_ROUTE_AFTER,
    APP_HOOKS_ON_PRE_ACTION,
    APP_HOOKS_ON_POST_ACTION_AFTER,
    APP_HOOKS_ON_PRE_EFFECT_ACTION,
    APP_HOOKS_ON_POST_EFFECT_ACTION,
];
