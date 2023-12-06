import React, { useEffect } from 'react';

import { Link, Outlet, useDispatch, useNamespacedSelector, useNavigate, useNavigation } from '@xams-framework/dusk';
import { Button, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import model, { AppState } from '@/business/inject/models/app.model';

dayjs.locale('zh-cn');

export default function App1() {
    const state: AppState = useNamespacedSelector('app');
    const dispatch = useDispatch();
    const navigation = useNavigation();
    useEffect(() => {
        console.log(navigation);
    }, [navigation]);
    return (
        <div
            className="app"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <button
                disabled={state.pending}
                onClick={async () => {
                    const res = await dispatch(model.commands.add());
                    console.log('请求结束...');
                    alert(JSON.stringify(res));
                }}
            >
                ++
            </button>
            count {state.value}
            {JSON.stringify(navigation)}
            <br />
            <ul>
                <li>
                    <Link to={'/'}> to / </Link>
                </li>
                <li>
                    <Link to={'/home'}>to Home</Link>
                </li>
                <li>
                    <Link to={'/login'}>to Login</Link>
                </li>
            </ul>
            <Outlet />
        </div>
    );
}

export function App() {
    const navigate = useNavigate();
    return (
        <ConfigProvider
            componentSize="middle"
            locale={zhCN}
            autoInsertSpaceInButton={true}
            theme={{
                token: {
                    colorPrimary: '#5072e0',
                    colorPrimaryBg: '#f0f6ff',
                    fontSizeHeading1: 28,
                    fontSizeHeading2: 24,
                    fontSizeHeading3: 22,
                    fontSize: 14,
                },
                components: {
                    Layout: {
                        colorBgBody: '#f4f4f8',
                    },
                },
                // algorithm: theme.darkAlgorithm,
            }}
        >
            <ul>
                <li>
                    <Link to={'/'}> to / </Link>
                </li>
                <li>
                    <Link to={'/home'}>to Home</Link>
                </li>
                <li>
                    <Link to={'/login'}>to login</Link>
                </li>
                <li>
                    <Button
                        onClick={() => {
                            navigate(-1);
                        }}
                    >
                        -1
                    </Button>
                </li>
                <li>
                    <Button
                        onClick={() => {
                            navigate(1);
                        }}
                    >
                        +1
                    </Button>
                </li>
            </ul>
            <Outlet />
        </ConfigProvider>
    );
}
