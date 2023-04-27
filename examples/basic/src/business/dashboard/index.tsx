// import { DuskApplication, Outlet, route, useParams, withDusk } from '@xams-framework/dusk';
// import React from 'react';
//
// @route({
//     path: '/dashboard',
//     children: [
//         {
//             path: 'foo',
//             element: <div>foo</div>,
//         },
//     ],
// }, withDusk)
// export default class DashboardIndex extends React.Component<{ $app: DuskApplication }, any> {
//
//     componentDidMount() {
//         const app = this.props.$app;
//         if (!sessionStorage['token']) {
//             app.$router.navigate('/');
//         }
//     }
//
//
//     @route({
//         path: 'views',
//         children: [
//             {
//                 path: ':id',
//                 element: <ViewDetail />,
//             },
//         ],
//     })
//     views() {
//         console.log(this);
//         return (
//             <div>views<Outlet /></div>
//         );
//     }
//
//     @route({
//         path: '*',
//     })
//     notfound() {
//         return (
//             <div>404</div>
//         );
//     }
//
//     render() {
//         // @ts-ignore
//         window.it = this;
//         return (
//             <div>
//                 dashboard
//                 <Outlet />
//             </div>
//         );
//     }
// }
//
// function ViewDetail() {
//     let { id } = useParams();
//     return (
//         <div>id: {id}</div>
//     );
// }
