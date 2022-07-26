import Dusk, { DUSK_APPS_COMPONENTS, normalizeDotRule, PluginFactory } from '../../';


export interface ComponentProperties {
    id: string;
    tid: string;        // component template tid
    default: any;        // component class
    factory: any;        // origin class
    props?: any;         // default props
}


export class ComponentManager {

    ctx: Dusk;

    private components: {
        [index: string]: ComponentProperties
    } = {};

    constructor(ctx: Dusk) {
        this.ctx = ctx;
    }

    component(options: ComponentProperties) {
        if (this.components[options.id]) {
            return;
        }
        this.components[options.id] = options;
    }

    get(id) {
        return this.components[normalizeDotRule(id)];
    }

}


export function createDuskInternalComponentManager(options?: any): PluginFactory {
    return (app) => {
        return {
            name: 'dusk-plugin-internal-component-manager',
            setup() {
                const cm = app._cm = new ComponentManager(app);
                const components: ComponentProperties[] = Reflect.getMetadata(DUSK_APPS_COMPONENTS, Dusk).concat([]);
                components.forEach((component) => {
                    cm.component(component);
                });
            },
        };
    };
}
