import Dusk, { DuskConfiguration, isProduction } from '../index';
import React from 'react';


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
export { default as createDuskPresetInternal } from './presets/dusk-preset-internal';
