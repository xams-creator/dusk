import Dusk, { Plugin } from '@xams-framework/dusk';

function isLoggedIn() {
    return !!localStorage.getItem('access_token');
}

export default function createValidator(options?: any) {
    return (app: Dusk): Plugin => {
        const history = app._history;
        return {
            name: 'app-login-validator',
            onLaunch(ctx, next) {
                console.log('app-login-validator');
                if (!isLoggedIn()) {
                    history.push('/user/login');
                }
                next();
            },
            onError(ctx, next, msg) {
                console.log('stop the onError chain');
            },
        };
    };
};
