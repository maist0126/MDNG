import React, {useEffect} from 'react';
import {Trail} from 'react-spring/renderprops';
import "./user.css"
import clap from './img/clap.png'
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function Like(propps) {
    const items = []
    for (let i = 0; i < 10; i ++) {
        items.push({left: `${getRandomInt(0, 10)*10}vw`, key: propps.key})
    }
    return (
        <Trail 
        items={items} 
        keys={item => item.key}
        from={{ opacity: 1, top: "100vh", trasform: "translate(-50%, -50%)" }} 
        to={{ opacity: 0, top: "0vh", trasform: "translate(-50%, -50%)"  }}>
            {item => props => <img src = {clap} style = {{
                opacity: props.opacity,
                top: props.top,
                left: item.left,
                trasform: props.trasform
            }} className = "clap_emoticon" width = "50px" alt ="clap" />}
        </Trail>
    )
}

export default Like;