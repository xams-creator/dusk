import Dusk, { inBrowser, PluginFunction } from '../..';
import { APP_HOOKS_ON_DOCUMENT_HIDDEN, APP_HOOKS_ON_DOCUMENT_VISIBLE, APP_HOOKS_ON_ERROR } from '../../business/plugin';


export function createDuskInternalEvent(): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-event',
            setup() {
                if (inBrowser()) {
                    const { addEventListener } = window;
                    // 这个只能捕获到 in promise 的 error,event.type 可以区分错误类型
                    const onError = event => {  // todo fix 当直接 throw new Error 时,react-dom 会进行一次 rethrow ，导致2次onError
                        // 调用前 event.defaultPrevented === false ,调用后 event.defaultPrevented === true,是否可以做某事
                        app.emit(APP_HOOKS_ON_ERROR, String(event.message || event.error?.message || event.reason?.message), event);
                        if (Dusk.configuration.experimental.caught) {
                            if (!event.defaultPrevented) {
                                event.preventDefault();
                            }
                        }
                    };
                    addEventListener('unhandledrejection', onError);
                    addEventListener('error', onError);
                    addEventListener('visibilitychange', (event) => {
                        const { visibilityState } = document;
                        const type = visibilityState === 'visible' ? APP_HOOKS_ON_DOCUMENT_VISIBLE : APP_HOOKS_ON_DOCUMENT_HIDDEN;
                        app.emit(type, event);
                    });
                }
            },
        };
    };
}
