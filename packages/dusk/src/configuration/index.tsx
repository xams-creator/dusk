import React from 'react';
import { DuskConfiguration } from '../types';
import { isProduction } from '../common';

export const configuration: DuskConfiguration = {
    plugin: {
        hooks: [],
    },
    logger: {},
    silent: isProduction(),
    strict: false,
    hmr: false,
    experimental: {
        context: false,
        caught: true,
    },
    suspense: {
        fallback: <React.Fragment />,
        renderLoading: <React.Fragment />,
    },
};

export { default as createDuskInternalPreset } from './presets/dusk-internal-preset';
export { getDuskApp } from './plugins/dusk-plugin-internal-app';
