import React, {useEffect} from 'react';
import {useSpring, animated} from 'react-spring';
import "./user.css"

function getRandomColor() {
    var o_letters = '89ABCDEF';
    var e_letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        if (i%2 === 0){
            color += o_letters[Math.floor(Math.random() * 8)];
        } else{
            color += e_letters[Math.floor(Math.random() * 16)];
        }
    }
    return color;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function MyUser(propps) {
    const [props, set] = useSpring(() => ({
        top: propps.top,
        left: propps.left,
        backgroundColor: getRandomColor(),
       }))
    useEffect(() => {  
        if (propps.state === 0){
            set({ top: `${getRandomInt(50, 90)}vh` , left: `${getRandomInt(35, 75)}vw`});
        } else if (propps.state === 1){
            set({ top: `${getRandomInt(50, 90)}vh` , left: `${getRandomInt(35, 75)}vw`});
        } else if (propps.state === 2){
            set({ top: '20vh' , left: '65vw', width: '24vmin', height: '24vmin', fontSize: '1rem'});
        } else if (propps.state === 3){
            set({ top: '29.6vh' , left: '51.3vw', width: '24vmin', height: '24vmin', fontSize: '1rem'});
        } else if (propps.state === 4){
            set({ top: '29.6vh' , left: '37.8vw', width: '24vmin', height: '24vmin', fontSize: '1rem'});
        } else if (propps.state === 5){
            set({ top: '50vh' , left: '14.25vw', width: '29vmin', height: '29vmin', fontSize: '1.25rem'});
        }
    });

    return (
        <animated.div
            className="User"
            state={propps.state}
            style={props}>
            <div className="User_name"> 
                {propps.name}
            </div>
        </animated.div>
    )
}

export default MyUser;