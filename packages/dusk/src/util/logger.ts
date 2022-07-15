import Dusk from '..';

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
