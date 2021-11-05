import * as React from 'react';

import './app.styl';

class App extends React.Component<any, any> {

    render() {
        return (
            <div className={'app'}>
                <h2>Hello World</h2>
                <h3 className={'title'}>dusk App！</h3>

                <h5>
                    <p><a href={'/model'}>go model</a></p>
                    <p><a href={'/route'}>go route</a></p>
                </h5>

                <div className={'radar'} style={{ display: 'none' }}>
                    <div className={'fan'} />
                </div>
            </div>
        );
    }

}

export default App;
