import React from 'react';
import { Button } from 'antd';
import { ResizableBox } from 'react-resizable';

import './index.scss';

export default function Home() {
    return (
        <div>
            home
            <Button type={'primary'}>123</Button>

            <button className='btn'>Hover me</button>
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



