import * as React from 'react';

/**
 * css module.css
 */
// import style from './css/css/index.module.css';
// import './css/css/index.css';

/**
 * scss module.scss
 */
// import style from './css/scss/index.module.scss';
// import './css/scss/index.scss';

/**
 * sass module.sass
 */
// import style from './css/sass/index.module.sass';
// import './css/sass/index.sass';

/**
 * less module.less
 */

/**
 * styl module.styl
 */
// import style from './css/styl/index.module.styl';
// import './css/styl/index.styl';
import style from './css/less/index.module.less';
import './css/less/index.less';





import App1 from './business/app1';

import vm from './app.view.json';

import {connect, Link, RouterView} from '@xams-framework/dusk';

class App extends React.Component<any> {


    render() {
        const {route, dispatch} = this.props;
        return <div className={`title ${style.title}`}>
            1243 {process.env.NODE_ENV} {vm.key}
            <App1/>

            <Link to={'/foo'} children={'go => foo'}/>

            <Link to={'/test/99'} children={'go => /test/99'}/>

            <Link to={'/test/11'} children={'go => /test/11'}/>

            <RouterView routes={route.routes}/>
        </div>;
    }


}

export default connect(
    (state: any, {route}: any) => {
        return state.app;
    }
)(App);
