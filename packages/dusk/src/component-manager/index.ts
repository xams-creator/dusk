import Dusk from '../index';


export interface ComponentProperties {
    tid: string,        // component template tid
    default: any        // component class
    factory?: any
    props?: any         // default props
}


export default class ComponentManager {

    ctx: Dusk;

    private components: {
        [index: string]: ComponentProperties
    };

    constructor(ctx: Dusk) {
        this.ctx = ctx;
        this.init();
    }

    init() {
        this.components = {};
    }

    component(options: ComponentProperties) {
        if (this.components[options.tid]) {
            return;
        }
        this.components[options.tid] = options;
    }

    get(tid) {
        return this.components[tid];
    }
}


