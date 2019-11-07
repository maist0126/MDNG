import React, {useEffect} from 'react';
import {useSpring, animated} from 'react-spring';
import "./user.css"
import ok from './img/ok.png'

function Message(propps) {
    const [props, set] = useSpring(() => ({
        top: propps.top,
        opacity: 1
       }))

    useEffect(() => {  
        if (propps.state === 0){
            set({ top: "-15%",  opacity: 0});
        } else if (propps.state === 3){
            set({ top: '15%',  opacity: 1});
        }
    });

    return (
        <animated.div
            className="message"
            state={propps.state}
            style={props}>
                <div className = "m_header"> 
                    <img src = {ok} className = "ok" width = "20px" alt ="ok" />
                    <div className = "m_title">
                        Lewis
                    </div>
                    <div className = "m_now">
                        now
                    </div>
                </div>
                <div className = "m_content"> 
                    {propps.text}
                </div>
                
        </animated.div>
    )
}

export default Message;