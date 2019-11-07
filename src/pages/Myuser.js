import React, {useEffect} from 'react';
import {useSpring, animated} from 'react-spring';
import "./user.css"
import user0 from "./img/user0.jpg";
import user1 from "./img/user1.jpg";
import user2 from "./img/user2.jpg";
import user3 from "./img/user3.jpg";
import user4 from "./img/user4.jpg";

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
            set({ top: propps.top , left: propps.left, width: '20vmin', height: '20vmin', fontSize: '1rem', boxShadow: "0px 2px 4px 2px rgba(0, 0, 0, 0.233)"});
        } else if (propps.state === 1){
            set({ top: propps.top , left: propps.left, width: '20vmin', height: '20vmin', fontSize: '1rem', boxShadow: "0px 2px 4px 2px rgba(0, 0, 0, 0.233)"});
        } else if (propps.state === 2){
            set({ top: '29.6vh' , left: '64.8vw', width: '24vmin', height: '24vmin', fontSize: '1.2rem', boxShadow: "0px 2px 4px 2px rgba(0, 0, 0, 0.233)"});
        } else if (propps.state === 3){
            set({ top: '29.6vh' , left: '51.3vw', width: '24vmin', height: '24vmin', fontSize: '1.2rem', boxShadow: "0px 2px 4px 2px rgba(0, 0, 0, 0.233)"});
        } else if (propps.state === 4){
            if (propps.radius === 3){
                set({ top: '29.6vh' , left: '37.8vw', width: '24vmin', height: '24vmin', fontSize: '1.2rem', boxShadow: "0px 4px 30px 6px rgba(255, 0, 255, 0.9)"});
            } else{
                set({ top: '29.6vh' , left: '37.8vw', width: '24vmin', height: '24vmin', fontSize: '1.2rem', boxShadow: "0px 2px 4px 2px rgba(0, 0, 0, 0.233)"});
            }
        } else if (propps.state === 5){
            set({ top: '50vh' , left: '14.25vw', width: '35vmin', height: '35vmin', fontSize: '1.75rem', boxShadow: "0px 2px 4px 2px rgba(0, 0, 0, 0.233)"});
        }
    });
    if (propps.name === "ME"){
        if (propps.id == 0){
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        {/* <div className="User_name"> 
                            {propps.name}
                        </div> */}
                        <img className = "user_png" src= {user0}></img>
                        <div className = "User_name">{propps.name}</div>
                </animated.div>
            )
        } else if (propps.id == 1){
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        <img className = "user_png" src= {user1}></img>
                        <div className = "User_name">{propps.name}</div>
                </animated.div>
            )
        } else if (propps.id == 2){
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        <img className = "user_png" src= {user2}></img>
                        <div className = "User_name">{propps.name}</div>
                </animated.div>
            )
        } else if (propps.id == 3){
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        <img className = "user_png" src= {user3}></img>
                        <div className = "User_name">{propps.name}</div>
                </animated.div>
            )
        } else{
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        <img className = "user_png" src= {user4}></img>
                        <div className = "User_name">{propps.name}</div>
                </animated.div>
            )
        }
    } else {
        if (propps.id == 0){
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        {/* <div className="User_name"> 
                            {propps.name}
                        </div> */}
                        <img className = "user_png" src= {user0}></img>
                </animated.div>
            )
        } else if (propps.id == 1){
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        <img className = "user_png" src= {user1}></img>
                </animated.div>
            )
        } else if (propps.id == 2){
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        <img className = "user_png" src= {user2}></img>
                </animated.div>
            )
        } else if (propps.id == 3){
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        <img className = "user_png" src= {user3}></img>
                </animated.div>
            )
        } else{
            return (
                <animated.div
                    className="User"
                    state={propps.state}
                    style={props}>
                        <img className = "user_png" src= {user4}></img>
                </animated.div>
            )
        }
    }
    
}

export default MyUser;