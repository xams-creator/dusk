import Dusk, { DuskConfiguration } from '../index';
import React from 'react';
import { isProduction } from '../common';

const configuration: DuskConfiguration = {
    plugin: {
        hooks: [],
    },
    logger: {},
    silent: isProduction(),
    strict: false,
    hmr: false,
    experimental: {
        context: true,
        caught: true,
    },
    suspense: {
        fallback: <React.Fragment />,
        renderLoading: <React.Fragment />,
    },
};

/**
 * 定义Dusk的全局化配置
 *
 * @internal
 */
export default function defineConfiguration() {
    Object.defineProperty(Dusk, 'configuration', {
        get() {
            return configuration;
        },
        set() {
            throw new Error('Do not replace the Dusk.config object, set individual fields instead.');
        },
    });
}

export { scheduler } from './plugins/dusk-plugin-internal-scheduler';
export { initializeRouter } from './plugins/dusk-plugin-internal-router';
export { default as createDuskInternalPreset } from './presets/dusk-internal-preset';
export { getDuskApp } from './plugins/dusk-plugin-internal-app';
