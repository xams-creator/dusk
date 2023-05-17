import _, { shuffle } from 'lodash';
import { useReactive } from 'ahooks';

import './index.scss';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Link } from '@xams-framework/dusk';
import { ResizableBox } from 'react-resizable';

export default function Home() {
    return (
        <div>
            home
            <Button type={'primary'}>123</Button>

            <button className="btn">Hover me</button>
            <div
                style={{
                    width: 500,
                    height: 500,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    backgroundColor: 'gold',
                }}
            >
                <ResizableBox
                    width={100}
                    height={100}
                    resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}
                >
                    <div style={{ height: '100%', backgroundColor: 'green' }}>
                        Some content
                    </div>
                </ResizableBox>
            </div>
        </div>
    );
}



