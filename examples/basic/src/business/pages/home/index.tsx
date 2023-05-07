import _, { shuffle } from 'lodash';
import { useReactive } from 'ahooks';

import './index.scss';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Link } from '@xams-framework/dusk';

export default function Home() {
    return (
        <div>
            home
            <Button type={'primary'}>123</Button>

        </div>
    );
}



