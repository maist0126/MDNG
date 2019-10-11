import React, {useEffect} from 'react';
import {useSpring, animated} from 'react-spring';
import "./user.css"
import fire from './fire';
import Sketch from "react-p5";



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

function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a === "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length === 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

function MyUser(propps) {
    const [props, set] = useSpring(() => ({
        top: propps.top,
        left: propps.left,
        backgroundColor: getRandomColor(),
       }))

    useEffect(() => {  
        if (propps.state === 0){
            set({ top: `${getRandomInt(50, 90)}%` , left: `${getRandomInt(85, 95)}%`});
        } else if (propps.state === 1){
            set({ top: '17.5%' , left: '85%'});
        } else if (propps.state === 2){
            set({ top: '17.5%' , left: '58%'});
        } else if (propps.state === 3){
            set({ top: '17.5%' , left: '45%'});
        } else if (propps.state === 4){
            set({ top: '17.5%' , left: '32%'});
        } else if (propps.state === 5){
            set({ top: '50%' , left: '15%'});
        }

        if (propps.radius === 5){
            set({ width: '5rem', height: '5rem'});
        } else if (propps.radius === 3){
            set({ width: '3rem', height: '3rem'});
        } else if (propps.radius === 4){
            set({ width: '4rem', height: '4rem'});
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



class UserPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            topic: undefined,
            users: [],
            reserve_done: false,
            full: false,
            t_full: false,
            now_id: 0,
            now: false,
            reservers: [],
            runtime: undefined
        }
    }
    componentWillMount() {
        fire.database().ref().child('mst_time').once('value').then(snapshot => {
            let time = 3600 - snapshot.val().time;
            let minutes = Math.floor((time % (60 * 60)) / 60);
            let seconds = Math.floor(time % 60);
            let m = minutes + ":" + seconds ;
            this.setState({ runtime: m });
        });
        fire.database().ref().child('mst_time').on('value', snapshot => {
            let time = 3600 - snapshot.val().time;
            let minutes = Math.floor((time % (60 * 60)) / 60);
            let seconds = Math.floor(time % 60);
            let m = minutes + ":" + seconds ;
            this.setState({ runtime: m });
        });
        fire.database().ref().child('topic').once('value').then(snapshot => {
            this.setState({ topic: snapshot.val() });
        });
        fire.database().ref().child('topic').on('value', snapshot => {
            this.setState({ topic: snapshot.val() });
        });
        fire.database().ref().child('data').once('value').then(snapshot => {
            let userTable = []
            let speech_mean = 0;
            for (let key in snapshot.val()){
                speech_mean = speech_mean + snapshot.val()[key].time;
                userTable.push({
                    id: snapshot.val()[key].id,
                    name: snapshot.val()[key].name,
                    color: snapshot.val()[key].color,
                    time: snapshot.val()[key].time,
                    state: 0,
                    radius: 4
                });
            }
            speech_mean = (speech_mean/userTable.length).toFixed(2);
            let high_mean = speech_mean*2;
            let low_mean = speech_mean*0.5;
            for (let i = 0; i<userTable.length; i++){
                userTable[i].radius = 0;
                if (userTable[i].time > high_mean){
                    if(userTable[i].time != 0){
                        userTable[i].radius = 5;
                    }
                } else if (userTable[i].time < low_mean){
                    if(userTable[i].time != 0){
                        userTable[i].radius = 3;
                    }
                }
            }
            this.setState({ users: userTable });
        });
        fire.database().ref().child('data').on('value', snapshot => {
            let userTable = []
            let speech_mean = 0;
            for (let key in snapshot.val()){
                speech_mean = speech_mean + snapshot.val()[key].time;
                userTable.push({
                    id: snapshot.val()[key].id,
                    name: snapshot.val()[key].name,
                    color: snapshot.val()[key].color,
                    time: snapshot.val()[key].time,
                    state: 0,
                    radius: 4
                });
            }
            speech_mean = (speech_mean/userTable.length).toFixed(2);
            let high_mean = speech_mean*2;
            let low_mean = speech_mean*0.5;
            for (let i = 0; i<userTable.length; i++){
                if (userTable[i].time > high_mean){
                    userTable[i].radius = 5;
                } else if (userTable[i].time < low_mean){
                    userTable[i].radius = 3;
                }
            }
            this.setState({ users: userTable });
        });
        fire.database().ref('order').once('value').then(snapshot => {
            let userTable = this.state.users;
            for (let j in userTable){
                userTable[j].state = 0;
            }
            userTable[getQueryStringObject().id].state = 1;
            let id_order = [];
            let i = 0;
            for (let key in snapshot.val()) {
                id_order.push(snapshot.val()[key].id);
                if (i === 0){
                    userTable[snapshot.val()[key].id].state = 5;
                    this.setState({
                        full: false,
                        t_full: false,
                        now_id: snapshot.val()[key].id
                    });
                } else if (i === 1){
                    userTable[snapshot.val()[key].id].state = 4;
                    this.setState({
                        full: false,
                        t_full: false
                    });
                } else if (i === 2){
                    userTable[snapshot.val()[key].id].state = 3;
                    this.setState({
                        full: true,
                        t_full: false
                    });
                } else if (i === 3){
                    userTable[snapshot.val()[key].id].state = 2;
                    this.setState({
                        full: true,
                        t_full: true
                    });
                }
                i ++;
            }
            for (let i = 0; i<id_order.length; i++){
                if (id_order[i] === getQueryStringObject().id){
                    this.setState({
                        reserve_done: true
                    });
                    break;
                } 
                this.setState({
                    reserve_done: false
                });
            }
            if (id_order[0] === getQueryStringObject().id){
                this.setState({
                    now: true
                });
                fire.database().ref().child('start_status').once('value').then(snapshot => {
                    if (snapshot.val().status === 0){
                        fire.database().ref().child('start_status').set({
                            status: 1
                        });
                    }
                });
            } else{
                this.setState({
                    now: false
                });
            }
            this.setState({ 
                users: userTable,
                reservers: id_order  });
        });
        fire.database().ref('order').on('value', snapshot => {
            let userTable = this.state.users;
            for (let j in userTable){
                userTable[j].state = 0;
            }
            userTable[getQueryStringObject().id].state = 1;
            let id_order = [];
            let i = 0;
            for (let key in snapshot.val()) {
                id_order.push(snapshot.val()[key].id);
                if (i === 0){
                    userTable[snapshot.val()[key].id].state = 5;
                    this.setState({
                        full: false,
                        t_full: false,
                        now_id: snapshot.val()[key].id
                    });
                } else if (i === 1){
                    userTable[snapshot.val()[key].id].state = 4;
                    this.setState({
                        full: false,
                        t_full: false
                    });
                } else if (i === 2){
                    userTable[snapshot.val()[key].id].state = 3;
                    this.setState({
                        full: true,
                        t_full: false
                    });
                } else if (i === 3){
                    userTable[snapshot.val()[key].id].state = 2;
                    this.setState({
                        full: true,
                        t_full: true
                    });
                }
                i ++;
            }
            for (let i = 0; i<id_order.length; i++){
                if (id_order[i] === getQueryStringObject().id){
                    this.setState({
                        reserve_done: true
                    });
                    break;
                } 
                this.setState({
                    reserve_done: false
                });
            }
            if (id_order[0] === getQueryStringObject().id){
                this.setState({
                    now: true
                });
                fire.database().ref().child('start_status').once('value').then(snapshot => {
                    if (snapshot.val().status === 0){
                        fire.database().ref().child('start_status').set({
                            status: 1
                        });
                    }
                });
            } else{
                this.setState({
                    now: false
                });
            }
            this.setState({ 
                users: userTable,
                reservers: id_order  });
        });
        
    }

    reserve_on = () => {
        if (this.state.users[getQueryStringObject().id].radius === 1){
            if (!this.state.reserve_done && !this.state.t_full){
                fire.database().ref().child('order').once('value').then(snapshot => {
                    let prom = [];
                    let i = 0;
                    for (let key in snapshot.val()){
                        if (i !== 0){
                            prom.push({id: snapshot.val()[key].id, name: snapshot.val()[key].name, radius: snapshot.val()[key].radius});
                            fire.database().ref().child('order/' + Object.keys(snapshot.val())[i]).remove();
                        }
                        i ++;
                    }
                    fire.database().ref('/order').push({
                        id: getQueryStringObject().id,
                        name: getQueryStringObject().name
                    });
                    for (let key in prom){
                        fire.database().ref('/order').push({
                            id: prom[key].id,
                            name: prom[key].name
                        });
                    }
                });
            } 
        }else{
            if(!this.state.reserve_done && !this.state.full){
                fire.database().ref('/order').push({
                    id: getQueryStringObject().id,
                    name: getQueryStringObject().name
                });
            }
            
        }
    }

    reserve_off = () => {
        let check = this.state.reservers;
        for (let i = 1; i < check.length; i++){
            if (check[i] == getQueryStringObject().id){
                fire.database().ref().child('order').once('value').then(function(snapshot){
                    fire.database().ref().child('order/' + Object.keys(snapshot.val())[i]).remove();
                });
            }
        }
    }

    quit = () => {
        if(this.state.now){
            fire.database().ref().child('start_status').set({
                status: 0
            });
            this.setState({
                reserve_done: false,
                now: false
            })
        }
    }

    add = () => {
        if(!this.state.now){
            
        }
    }

    subtract = () => {
        if(!this.state.now){
            
        }
    }
    setup = (p5, parent) => {
        p5.createCanvas(140, 140).parent(parent)
    }
    draw = p5 => {
        fire.database().ref().child('rem_time').on('value', snapshot => {
            if (snapshot.val().time > 0){
                let minutes = Math.floor((snapshot.val().time % (60 * 60)) / 60);
                let seconds = Math.floor(snapshot.val().time % 60);
                let m = minutes + ":" + seconds ; 
                // if (seconds < 15){
                //     document.getElementById("user_blue_time").innerHTML = m;   
                // } else{
                //     document.getElementById("user_blue_time").innerHTML = ""; 
                // }
                // document.getElementById("user_blue_time").style.color = '#ffffff';
        
                let diff = ((snapshot.val().time/60)*Math.PI*2*10).toFixed(2);
                p5.background(47,25,130);
                p5.fill(0,153,255);
                p5.strokeWeight(1);
                p5.stroke(0,153,255);
                p5.arc(70, 70, 140, 140, -Math.PI*0.5, diff/10-Math.PI*0.5);
                
            } else {
                let red_indicator = snapshot.val().time * (-1);
                let minutes = Math.floor((red_indicator % (60 * 60)) / 60);
                let seconds = Math.floor(red_indicator % 60);
                let m = "- " + minutes + ":" + seconds; 
                // document.getElementById("user_blue_time").innerHTML = m;
                // document.getElementById("user_blue_time").style.color = '#ff0000';
        
                let diff = ((red_indicator/60)*Math.PI*2*10).toFixed(2);
                p5.background(47,25,130);
                p5.fill(255,0,0);
                p5.strokeWeight(1);
                p5.stroke(0,153,255);
                p5.arc(70, 70, 140, 140, -Math.PI*0.5, diff/10-Math.PI*0.5);
            }
        });
    }

    render(){
        const userTable = this.state.users;
        return (
            <div className = "UserPage">
                <div className = "div3">  
                </div>
                <div className = "div2">
                </div>
                <div className = "center_box">
                    <div className = "heading">
                            회의 주제
                    </div>
                    <div className = "title">
                        {this.state.topic}
                    </div>
                    <div className = "running_time">
                        남은시간 : {this.state.runtime}
                    </div>
                    <div className = "memo">
                        <textarea rows="1" cols="33"> </textarea>
                    </div>
                </div>
                <div className = "div1" onClick={this.add}>
                </div>
                
                
                <div className = "reserve_on" 
                style = {{display: ((this.state.reserve_done) || (this.state.t_full)) ? 'none' : 'block'}}
                onClick={this.reserve_on}>
                </div>
                <div className = "reserve_off" 
                style = {{display: this.state.reserve_done ? 'block' : 'none'}} 
                onClick={this.reserve_off}>
                </div> 
                <div className = "quit" 
                style = {{display: this.state.now ? 'block' : 'none'}}
                onClick={this.quit}>
                </div>
                <div className = "subtract" 
                style = {{display: this.state.now ? 'none' : 'block'}}
                onClick={this.subtract}>
                </div>
                <div className = "canvas" >
                    <Sketch setup={this.setup} draw={this.draw} />
                </div>
                {userTable.map((value, index) => {
                    if (value.name === getQueryStringObject().name){
                        return <MyUser 
                        key={index} 
                        state={value.state}
                        name="ME" 
                        top="20%" 
                        left="85%"
                        radius={value.radius}></MyUser>
                    } else {
                        return <MyUser 
                        key={index} 
                        state={value.state}
                        name={value.name} 
                        top={`${getRandomInt(50, 90)}%`} 
                        left={`${getRandomInt(85, 95)}%`}
                        radius={value.radius}></MyUser>
                    }
                })}
                
            </div>
            
        );
    }
}

export default UserPage ;
