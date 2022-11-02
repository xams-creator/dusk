import Dusk, { DuskConfiguration, isProduction } from '../index';
import React from 'react';

export * from './plugins/dusk-plugin-internal-axios';
export * from './plugins/dusk-plugin-internal-event';
export * from './plugins/dusk-plugin-internal-context';
export * from './plugins/dusk-plugin-internal-models';
export * from './plugins/dusk-plugin-internal-scheduler';
export * from './plugins/dusk-plugin-topic';
export * from './plugins/dusk-plugin-internal-router';
export * from './plugins/dusk-plugin-internal-redux';


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
