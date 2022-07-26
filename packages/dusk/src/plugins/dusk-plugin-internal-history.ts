import { AppHistoryConfig, logger, PluginFactory } from '../index';
import {
    createBrowserHistory,
    createHashHistory,
    createMemoryHistory, History,
} from 'history';

const enum MODE {
    HASH = 'hash',
    BROWSER = 'browser',
    MEMORY = 'memory'
}

export function createDuskInternalHistory(history: AppHistoryConfig): PluginFactory {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-history',
            setup() {
                if (history && !history.hasOwnProperty('mode')) {
                    app.$history = (history as History);
                    return;
                }
                const { mode, options }: any = history || {};
                switch (mode) {
                    case MODE.HASH:
                        app.$history = createHashHistory(options);
                        break;
                    case MODE.MEMORY:
                        app.$history = createMemoryHistory(options);
                        break;
                    case MODE.BROWSER:
                        app.$history = createBrowserHistory(options);
                        break;
                    default:
                        logger.warn('unknown history mode! will use browser history');
                        app.$history = createBrowserHistory(options);
                        break;
                }
            },
        };
    };
}
