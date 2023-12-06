import React, { useEffect } from 'react';
import FlipMove from 'react-flip-move';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useReactive } from 'ahooks';
import { Button, Card, Carousel, Checkbox, Form, Input } from 'antd';
import { shuffle } from 'lodash';

import './index.scss';

export default function Login() {
    return (
        <div className={'app-login-page'}>
            <FlipImageBox />
            <LeftBox />
        </div>
    );
}

const FlipImageBox = () => {
    const state = useReactive({
        bgList: ['bar_y', 'bar_x', 'line_gradient', 'line', 'funnel', 'heatmap', 'map', 'pie', 'radar'],
    });

    useEffect(() => {
        const interval = setInterval(() => {
            state.bgList = shuffle(state.bgList);
        }, 2000);
        return () => {
            clearInterval(interval);
        };
    }, [state]);

    return (
        <div className={'app-right-body'}>
            <div className={'app-img-slot'}></div>
            <FlipMove staggerDurationBy="30" duration={500} className={'app-img-box'}>
                {state.bgList.map(item => {
                    return (
                        <div className="app-img-box-li " key={item}>
                            <img src={`/images/charts/${item}.png`} alt="chart" />
                        </div>
                    );
                })}
            </FlipMove>
        </div>
    );
};

const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
};

function LeftBox() {
    return (
        <div className={'app-left-body'}>
            <div className={'app-login-carousel'}>
                <Carousel autoplay>
                    <img src={`/images/login/one.png`} alt="chart" />
                    <img src={`/images/login/two.png`} alt="chart" />
                    <img src={`/images/login/three.png`} alt="chart" />
                </Carousel>
            </div>
            <div className={'login-account'}>
                <div className={'login-account-container'}>
                    <Card
                        className="login-account-card"
                        title={'登录'}
                        headStyle={{
                            fontWeight: 500,
                            flex: '1',
                            minWidth: '0',
                            color: 'rgb(31, 34, 37)',
                            border: 0,
                        }}
                    >
                        <div className="login-account-top">
                            <img className="login-account-top-logo" src={'/images/login/input.png'} alt="展示图片" />
                        </div>
                        <Form>
                            <Form.Item>
                                <Input prefix={<UserOutlined size={18} style={{ color: 'gray' }} />} size={'large'} />
                            </Form.Item>
                            <Form.Item>
                                <Input.Password
                                    prefix={<LockOutlined size={18} style={{ color: 'gray' }} />}
                                    size={'large'}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Checkbox>自动登录</Checkbox>
                            </Form.Item>
                            <Form.Item>
                                <Button type={'primary'} block size={'large'}>
                                    登录
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
