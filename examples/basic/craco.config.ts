import { CracoConfig, CracoPluginDefinition } from '@craco/types';
import createCracoDuskHmr from '@xams-framework/craco-plugin-dusk-hmr';

function defineCraco(options: CracoConfig): CracoConfig {
    return options;
}

export default defineCraco({
    plugins: [createCracoWebpackPlugin(), createCracoDuskHmr()],
    webpack: {
        alias: {
            '@': 'src',
        },
    },
});

function createCracoWebpackPlugin(): CracoPluginDefinition<any> {
    return {
        plugin: {
            overrideWebpackConfig({ webpackConfig: webpack }) {
                return webpack;
            },
        },
    };
}
