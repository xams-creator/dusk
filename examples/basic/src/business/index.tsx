import React from 'react';

const Home = React.lazy(() => import('./pages/home'));
const Login = React.lazy(() => import('./pages/login'));

export { Home, Login };
