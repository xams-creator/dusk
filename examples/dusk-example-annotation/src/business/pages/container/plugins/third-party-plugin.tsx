import { PluginFactory } from '@xams-framework/dusk';
import React from 'react';

class ContainerD extends React.Component<any, any> {

    render() {
        const props = this.props;
        return (
            <div>
                容器测试D
                <pre>
                    {
                        JSON.stringify(props, null, 4)
                    }
                </pre>
            </div>
        );
    }
}

export default function createThirdPartyContainerPlugin(options?: any): PluginFactory {
    return (app) => {
        return {
            name: 'third-party-container',
            onReady(ctx) {
                app.component({
                    tid: 'pages/container/d',
                    default: ContainerD,
                });
            },
        };
    };
}