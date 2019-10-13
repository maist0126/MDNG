import React, {useEffect} from 'react';
import {useSpring, animated} from 'react-spring';
import "./user.css"

function Message(propps) {
    const [props, set] = useSpring(() => ({
        top: propps.top,
        opacity: 1
       }))

    useEffect(() => {  
        if (propps.state === 0){
            set({ top: "-15%",  opacity: 0});
        } else if (propps.state === 1){
            set({ top: '15%', opacity: 0.3});
        } else if (propps.state === 2){
            set({ top: '15%',  opacity: 0.5});
        } else if (propps.state === 3){
            set({ top: '15%',  opacity: 1});
        }
    });

    return (
        <animated.div
            className="message"
            state={propps.state}
            style={props}>
                충분히 들었어요 😌
        </animated.div>
    )
}

export default Message;