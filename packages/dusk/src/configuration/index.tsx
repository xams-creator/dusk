import React from 'react';
import { DuskConfiguration } from '../types';

export const configuration: DuskConfiguration = {
    plugin: {
        hooks: [],
    },
    logger: {},
    silent: true,
    strict: false,
    hmr: false,
    experimental: {
        context: false,
        caught: false,
    },
    suspense: {
        fallback: <React.Fragment />,
        renderLoading: <React.Fragment />,
    },
};

export { default as createDuskInternalPreset } from './presets/dusk-internal-preset';
export { getDuskApp } from './plugins/dusk-plugin-internal-app';
