import Dusk from '../../index';

// primary-color #1890ff
// success: #52c41a;
// error-color: #ff4d4f;
// warning-color: #faad14;
// info-color: #1890ff;
/*
*   console.groupCollapsed('%c 123 %c 456','color: #1890ff','color: red');
    console.log('__123')
    console.groupEnd();
*
* */
const infoStyle = 'color:#1890ff';

export function info(msg: string, ...args: any[]) {
    if (!Dusk.configuration.silent) {
        if (!Dusk.configuration.logger.info) {
            console.info(`[Dusk info] ${msg}`, ...args);
        } else {
            Dusk.configuration.logger.info.call(null, msg, ...args);
        }
    }
}

export function warn(msg: string, ...args: any[]) {
    if (!Dusk.configuration.silent) {
        if (!Dusk.configuration.logger.warn) {
            console.warn(`[Dusk warn] ${msg}`, ...args);
        } else {
            Dusk.configuration.logger.warn.call(null, msg, ...args);
        }
    }
}

export function error(msg: string, ...args: any[]) {
    if (!Dusk.configuration.silent) {
        if (!Dusk.configuration.logger.error) {
            console.error(`[Dusk error] ${msg}`, ...args);
        } else {
            Dusk.configuration.logger.error.call(null, msg, ...args);
        }
    }
}

// export function group(level: 'error' | 'info' | 'warn', title: string, details: string | string[]) {
//     console.groupCollapsed(`%c ${title}`, infoStyle);
//     Array.isArray(details)
//         ? details.forEach((detail) => {
//             info(detail);
//         }) : info(details);
//     console.groupEnd();
// }
