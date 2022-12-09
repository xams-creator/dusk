import React from 'react';
import Dusk, { DuskConfiguration, readOnly } from '../index';
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
    readOnly(Dusk, 'configuration', configuration);
}

export { scheduler } from './plugins/dusk-plugin-internal-scheduler';
export { initializeRouter } from './plugins/dusk-plugin-internal-router';
export { default as createDuskInternalPreset } from './presets/dusk-internal-preset';
export { getDuskApp } from './plugins/dusk-plugin-internal-app';
