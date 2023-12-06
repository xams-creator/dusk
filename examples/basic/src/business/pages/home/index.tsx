import React from 'react';
import { ResizableBox } from 'react-resizable';

import { Button } from 'antd';

import useViewModel from '@/common/hooks/use-view-model';

import './index.scss';

export default function Home() {
    const vm = useViewModel({
        state: {
            count: 1,
            foo: [],
        },
        methods: {
            add(v: number) {
                vm.count += 1;
            },
        },
    });
    window.vm = vm;
    return (
        <div>
            home
            <Button type={'primary'} onClick={() => vm.add(123)}>
                {vm.count}
            </Button>
            <button className="btn">Hover me</button>
            {/*<div*/}
            {/*    style={{*/}
            {/*        width: 500,*/}
            {/*        height: 500,*/}
            {/*        display: 'flex',*/}
            {/*        alignItems: 'flex-end',*/}
            {/*        justifyContent: 'flex-end',*/}
            {/*        backgroundColor: 'gold',*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <ResizableBox*/}
            {/*        width={100}*/}
            {/*        height={100}*/}
            {/*        resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}*/}
            {/*    >*/}
            {/*        <div style={{ height: '100%', backgroundColor: 'green' }}>*/}
            {/*            Some content*/}
            {/*        </div>*/}
            {/*    </ResizableBox>*/}
            {/*</div>*/}
        </div>
    );
}
