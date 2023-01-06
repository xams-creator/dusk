import { PluginFunction } from '@xams-framework/dusk';


export function Foo(props) {
    console.log(props);
    return <div>foo1</div>;
}


export default function createC(): PluginFunction {
    return (app) => {
        return {
            name: 'dusk-plugin-c',
            setup() {
                app.component({
                    id: 'foo',
                    default: Foo,
                });
            },
        };
    };
}
