import React from 'react';
import { route, RouteConfigComponentProps, RouterView } from '@xams-framework/dusk';
import RouteDetail from '@/business/pages/route/components/route-detail';
/*
   todo? : 经过测试，目前个人感觉可能不符合操作习惯 (react-router6 会有一波大优化)
    (2021年11月6日00:16:14: dusk 0.0.14，这个装饰器描述视乎太过通用。而且当前功能只处理了独立路由，只会从根开始，而不是从 `/` 开始感觉有些怪异 )
    (route第二个参数要改，改成@container第三个参数)
    (route提供扩展方法app.route)
**/

@route({
    path: '/route',
    routes: [
        {
            path: '/route/:id',
            exact: true,
            component: RouteDetail,
        },
    ],
})
export default class Route extends React.Component<RouteConfigComponentProps> {

    render() {
        window.route = this;
        const { routes } = this.props.route;
        return (
            <div>
                <h2>route</h2>
                <h4>
                    <RouterView routes={routes} />
                </h4>
                <ul>
                    <li>
                        <a href={'/'}>go app</a>
                    </li>
                    <li>
                        <a href={'/route'}>go route</a>
                    </li>
                    <li>
                        <ul>
                            <li><a href={'/route/1'}>go route detail id: 1</a></li>
                            <li><a href={'/route/2'}>go route detail id: 2</a></li>
                            <li><a href={'/route/3'}>go route detail id: 3</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        );
    }

}