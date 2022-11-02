// import { DuskHistoryOptions, logger, PluginFunction } from '../../index';
// import {
//     createBrowserHistory,
//     createHashHistory,
//     createMemoryHistory, History,
// } from 'history';
// import { MODE } from '../../common';
//
// export function createDuskInternalHistory(history: DuskHistoryOptions): PluginFunction {
//     return (app) => {
//         return {
//             name: 'dusk-plugin-internal-history',
//             setup() {
//                 if (history && !history.hasOwnProperty('mode')) {
//                     app.$history = (history as History);
//                     return;
//                 }
//                 const { options }: any = history || {};
//                 switch (app.mode) {
//                     case MODE.HASH:
//                         app.$history = createHashHistory(options);
//                         break;
//                     case MODE.MEMORY:
//                         app.$history = createMemoryHistory(options);
//                         break;
//                     case MODE.BROWSER:
//                         app.$history = createBrowserHistory(options);
//                         break;
//                     default:
//                         logger.warn('unknown history mode! will use browser history');
//                         app.$history = createBrowserHistory(options);
//                         break;
//                 }
//             },
//         };
//     };
// }
