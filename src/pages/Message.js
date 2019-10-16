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
        } else if (propps.state === 1){
            set({ top: '20%', opacity: 0.6});
        } else if (propps.state === 2){
            set({ top: '20%',  opacity: 0.8});
        } else if (propps.state === 3){
            set({ top: '20%',  opacity: 1});
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
                        Rally
                    </div>
                    <div className = "m_now">
                        now
                    </div>
                </div>
                <div className = "m_content"> 
                    청자들이 충분히 이해한 것 같습니다.
                </div>
                
        </animated.div>
    )
}

export default Message;