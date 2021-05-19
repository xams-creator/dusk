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

// import './css/less/index.less';
// import style from './css/less/index.module.less';

/**
 * merged
 * postcss
 */
import style from './css/merged/index.less';
import './css/postcss/index.less';


class App extends React.Component<any, any> {


    render() {
        return (
            <div className={`title ${style.title}`}>
                Hello world dusk！
                <div className="postcss">-------</div>
            </div>
        );
    }

}

export default App;
