import { DuskApplication } from '../../types';
import { Plugin, PluginFunction } from './types';

export default class PluginBuilder {
    private plugin: Plugin;

    name(name) {
        this.plugin.name = name;
        return this;
    }

    setup(fn: (app: DuskApplication) => void) {
        this.plugin.setup = fn;
        return this;
    }

    hook(name: string, fn: any) {
        this.plugin[name] = fn;
        return this;
    }

    build(): PluginFunction {
        return (app: DuskApplication) => {
            return this.plugin;
        };
    }
}
