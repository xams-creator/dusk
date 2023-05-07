import _, { shuffle } from 'lodash';
import { useReactive } from 'ahooks';

import './index.scss';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useEffect, useState } from 'react';

export default function Home() {
    return (
        <div>
            home
            ------
            <App2 />
        </div>
    );
}

const App2 = () => {
    const [items, setItems] = useState([
        { name: 'Item 1', id: 1 },
        { name: 'Item 2', id: 2 },
        { name: 'Item 3', id: 3 },
        { name: 'Item 4', id: 4 },
        { name: 'Item 5', id: 5 },
        { name: 'Item 6', id: 6 },
    ]);

    const [isShuffling, setIsShuffling] = useState(false);

    const shuffleItems = () => {
        setIsShuffling(true);
        setTimeout(() => {
            setItems(shuffle(items));
            setIsShuffling(false);
        }, 1000);
    };

    return (
        <div className="container">
            <h1>React List Shuffle with Transitions</h1>
            <div className={`item-container ${isShuffling ? 'shuffling' : ''}`}>
                {items.map((item) => (
                    <div key={item.id} className="item">
                        {item.name}
                    </div>
                ))}
            </div>
            <button onClick={shuffleItems}>Shuffle</button>
        </div>
    );
};


const App = () => {
    const state = useReactive({
        items: [
            { id: 1, number: 1 },
            { id: 2, number: 2 },
            { id: 3, number: 3 },
            { id: 4, number: 4 },
            { id: 5, number: 5 },
            { id: 6, number: 6 },
        ],
    });

    useEffect(() => {
        // setInterval(() => {
        //     state.items = [];
        // }, 1000);
        // setInterval(() => {
        //     // const items = state.items;
        //     // state.items = [];
        //     state.items = shuffle(state.items);
        // }, 4000);
    }, [state]);

    const [items, setItems] = useState([
        { name: 'Item 1', id: 1 },
        { name: 'Item 2', id: 2 },
        { name: 'Item 3', id: 3 },
        { name: 'Item 4', id: 4 },
        { name: 'Item 5', id: 5 },
        { name: 'Item 6', id: 6 },
    ]);

    const sortItems = () => {
        setItems([]);
        setTimeout(() => {
            setItems(shuffle(items));
        }, 1111);

        // setItems([...items].sort((a, b) => a.name.localeCompare(b.name)));
    };

    return (
        <div>
            <button onClick={() => {
                state.items = shuffle(state.items);
            }}>Shuffle
            </button>
            <div className='square-container'>
                <TransitionGroup className='square-group'>
                    {state.items.map((item) => (
                        <CSSTransition key={item.id} timeout={1000} classNames='square'>
                            <div className='square'>{item.number}</div>
                        </CSSTransition>
                    ))}
                </TransitionGroup>
            </div>
        </div>
    );
};
