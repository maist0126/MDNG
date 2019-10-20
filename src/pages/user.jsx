import React from 'react';
import "./user.css"
import fire from './fire';
import MyUser from './Myuser';
import Message from './Message';
import Like from './Like';
import Saying from './Saying';
import Sketch from "react-p5";
import clap from "./img/clap.png";
import wow from "./img/wow.png";
import like from "./img/like.png";

import cel from "./img/cel.png";

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

function firelistener(ref, type, fun) {
    fire.database().ref(ref).once(type).then(fun);
    fire.database().ref(ref).on(type, fun);
}

class UserPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            topic: undefined,
            users: [{
                id: 0,
                name: "",
                color: "#000000",
                time: 0,
                penalty: 0,
                state: 0,
                radius: 0
            }],
            my_id: getQueryStringObject().id,
            reserve_done: false,
            full: false,
            t_full: false,
            now: false,
            reservers: [],
            runtime: undefined,
            clock_status: false,
            add_status: [],
            sub_status: 0,
            start_status: 0,
            speech_status: false,
            sub_clicked: 0
        }
    }
    componentWillMount() {
        // firelistener("mst_time", snapshot => {
        //     let time = 3600 - snapshot.val().time;
        //     let minutes = Math.floor((time % (60 * 60)) / 60);
        //     let seconds = Math.floor(time % 60);
        //     let m = minutes + ":" + seconds ;
        //     this.setState({ runtime: m });
        // });
        firelistener("topic","value", snapshot => {
            this.setState({ topic: snapshot.val() });
        });
        firelistener("start_status", "value", snapshot => {
            if (snapshot.val().status === 2){
                this.setState({ clock_status: true, start_status: 2, speech_status: false });
            } else if (snapshot.val().status === 1) {
                this.setState({ clock_status: false, start_status: 1, speech_status: true });
            } else if (snapshot.val().status === 0) {
                fire.database().ref('add').set(null);
                fire.database().ref('subtract').set(null);
                fire.database().ref('subtracted').set(null);
                this.setState({ clock_status: false, start_status: 0, add_status: [], sub_status: 0, speech_status: false });
            }
        });
        fire.database().ref("data").once("value").then(snapshot => {
            let userTable = []
            let speech_mean = 0;
            let aa = 0;
            for (let key in snapshot.val()){
                speech_mean = speech_mean + snapshot.val()[key].time;
                userTable.push({
                    key: Object.keys(snapshot.val())[aa],
                    id: snapshot.val()[key].id,
                    name: snapshot.val()[key].name,
                    color: snapshot.val()[key].color,
                    time: snapshot.val()[key].time,
                    penalty: snapshot.val()[key].penalty,
                    state: 0,
                    radius: 4
                });
                aa ++;
            }
            speech_mean = (speech_mean/userTable.length).toFixed(2);
            let high_mean = speech_mean*2;
            let low_mean = speech_mean*0.5;
            for (let i = 0; i<userTable.length; i++){
                if (userTable[i].time > high_mean){
                    if(userTable[i].time !== 0){
                        userTable[i].radius = 5;
                    }
                } else if (userTable[i].time < low_mean){
                    if(userTable[i].time !== 0){
                        userTable[i].radius = 3;
                    }
                }
            }
            this.setState({ users: userTable });
        });
        
        fire.database().ref("data").on("child_added", snapshot => {
            let userTable = [...this.state.users];
            userTable.push({
                key: snapshot.key,
                id: snapshot.val().id,
                name: snapshot.val().name,
                color: snapshot.val().color,
                time: snapshot.val().time,
                penalty: snapshot.val().penalty,
                state: 0,
                radius: 4
            });
            let speech_mean = 0;
            for (let key in userTable){
                speech_mean = speech_mean + userTable[key].time;
            }
            speech_mean = (speech_mean/userTable.length).toFixed(2);
            let high_mean = speech_mean*2;
            let low_mean = speech_mean*0.5;
            for (let key in userTable){
                if (userTable[key].time > high_mean){
                    if(userTable[key].time !== 0){
                        userTable[key].radius = 5;
                    }
                } else if (userTable[key].time < low_mean){
                    if(userTable[key].time !== 0){
                        userTable[key].radius = 3;
                    }
                }
            }
            this.setState({ users: userTable });
        });

        fire.database().ref("data").on("child_changed", snapshot => {
            let userTable = [...this.state.users];
            userTable.splice(snapshot.val().id, 1, {
                key: snapshot.key,
                id: snapshot.val().id,
                name: snapshot.val().name,
                color: snapshot.val().color,
                time: snapshot.val().time,
                penalty: snapshot.val().penalty,
                state: 0,
                radius: 4
            });
            let speech_mean = 0;
            for (let key in userTable){
                speech_mean = speech_mean + userTable[key].time;
            }
            speech_mean = (speech_mean/userTable.length).toFixed(2);
            let high_mean = speech_mean*2;
            let low_mean = speech_mean*0.5;
            for (let key in userTable){
                if (userTable[key].time > high_mean){
                    if(userTable[key].time !== 0){
                        userTable[key].radius = 5;
                    }
                } else if (userTable[key].time < low_mean){
                    if(userTable[key].time !== 0){
                        userTable[key].radius = 3;
                    }
                }
            }
            this.setState({ users: userTable });
        });

        fire.database().ref("order").once("value").then(snapshot => {
            let userTable = [...this.state.users];
            for (let j in userTable){
                userTable[j].state = 0;
            }
            userTable[this.state.my_id].state = 1;
            let reservers_id = [];
            let i = 0;
            for (let key in snapshot.val()) {
                reservers_id.push(snapshot.val()[key].id);
            }
            for (let key in reservers_id){
                if (reservers_id[key] === this.state.my_id){
                    this.setState({
                        now: false,
                        reserve_done: true
                    });
                    break;
                } else{
                    this.setState({
                        now: false,
                        reserve_done: false
                    });
                }
            }
            if(reservers_id.length > 0){
                userTable[reservers_id[0]].state = 5;
                this.setState({
                    full: false,
                    t_full: false
                });
                if (reservers_id[0] === this.state.my_id){
                    this.setState({
                        now: true
                    });
                    fire.database().ref().child('start_status').once('value').then(snapshot => {
                        if (snapshot.val().status === 0){
                            fire.database().ref().child('start_status').set({ status: 1 });
                        }
                    });
                }
                if(reservers_id.length > 1){
                    userTable[reservers_id[1]].state = 4;
                    if(reservers_id.length > 2){
                        userTable[reservers_id[2]].state = 3;
                        this.setState({
                            full: true
                        });
                        if(reservers_id.length > 3){
                            userTable[reservers_id[3]].state = 2;
                            this.setState({
                                t_full: true
                            });
                        }
                    }
                }
            }  
            this.setState({ 
                users: userTable,
                reservers: reservers_id  });
        });

        fire.database().ref("order").on("child_added", snapshot => {
            let userTable = [...this.state.users];
            let reservers_id = [...this.state.reservers];
            reservers_id.push(snapshot.val().id);
            userTable[snapshot.val().id].state = 6-reservers_id.length;
            if(snapshot.val().id === this.state.my_id){
                this.setState({
                    now: false,
                    reserve_done: true
                });
            }
            if (reservers_id.length === 1){
                if (reservers_id[0] === this.state.my_id){
                    this.setState({
                        now: true
                    });
                    fire.database().ref().child('start_status').once('value').then(snapshot => {
                        if (snapshot.val().status === 0){
                            fire.database().ref().child('start_status').set({ status: 1 });
                        }
                    });
                }
            }
            this.setState({ 
                users: userTable,
                reservers: reservers_id  });
        });

        fire.database().ref("order").on("child_removed", snapshot => {
            let userTable = [...this.state.users];
            if (snapshot.val().id === this.state.my_id){
                userTable[this.state.my_id].state = 1;
            } else if(snapshot.val().id !== this.state.my_id){
                userTable[snapshot.val().id].state = 0;
            }
            let reservers_id = [...this.state.reservers];
            reservers_id.splice(reservers_id.findIndex((element) => {
                return element === snapshot.val().id
            }), 1);
            if(snapshot.val().id === this.state.my_id){
                this.setState({
                    now: false,
                    reserve_done: false
                });
            }
            if(reservers_id.length > 0){
                userTable[reservers_id[0]].state = 5;
                this.setState({
                    full: false,
                    t_full: false
                });
                if (reservers_id[0] === this.state.my_id){
                    this.setState({
                        now: true
                    });
                    fire.database().ref().child('start_status').once('value').then(snapshot => {
                        if (snapshot.val().status === 0){
                            fire.database().ref().child('start_status').set({ status: 1 });
                        }
                    });
                }
                if(reservers_id.length > 1){
                    userTable[reservers_id[1]].state = 4;
                    if(reservers_id.length > 2){
                        userTable[reservers_id[2]].state = 3;
                        this.setState({
                            full: true
                        });
                        if(reservers_id.length > 3){
                            userTable[reservers_id[3]].state = 2;
                            this.setState({
                                t_full: true
                            });
                        }
                    }
                }
            }  
            this.setState({ 
                users: userTable,
                reservers: reservers_id  });
        });
        fire.database().ref("add").on('child_added', snapshot => {
            if(this.state.start_status !== 0){
                let likes = [...this.state.add_status];
                likes.push(<Like key = {getRandomInt(0, 1000)}></Like>);
                this.setState({
                    add_status: likes
                });
            }
        });
        fire.database().ref("subtract").on('child_added', snapshot => {
            if(this.state.start_status !== 0){
                if (this.state.now){
                    fire.database().ref('/subtracted/'+snapshot.val().id).set({
                        status: 1  
                    });
                    fire.database().ref().child('subtract/' + snapshot.key).remove();
                }
            }
        });
        firelistener("subtracted", "value", snapshot => {
            if (this.state.now){
                let i = 0;
                for (let key in snapshot.val()){
                    i++;
                }
                if (i === 0){
                    this.setState({
                        sub_status: 0
                    });
                } else if (i === 1){
                    this.setState({
                        sub_status: 1
                    });
                } else if (i === 2){
                    this.setState({
                        sub_status: 2
                    });
                } else if (i > 2){
                    this.setState({
                        sub_status: 3
                    });
                }
            }
        });
    }

    reserve_on = () => {
        if (this.state.users[getQueryStringObject().id].radius === 3){
            if (!this.state.reserve_done && !this.state.t_full){
                fire.database().ref().child('order').once('value').then(snapshot => {
                    let prom = [];
                    let i = 0;
                    for (let key in snapshot.val()){
                        if (i !== 0){
                            prom.push({id: snapshot.val()[key].id, name: snapshot.val()[key].name, key: snapshot.val()[key].key});
                            fire.database().ref().child('order/' + Object.keys(snapshot.val())[i]).remove();
                        }
                        i ++;
                    }
                    fire.database().ref('/order').push({
                        id: getQueryStringObject().id,
                        name: getQueryStringObject().name,
                        key: this.state.users[this.state.my_id].key
                    });
                    for (let key in prom){
                        fire.database().ref('/order').push({
                            id: prom[key].id,
                            name: prom[key].name,
                            key: prom[key].key
                        });
                    }
                    this.setState({
                        reserve_done: true
                    });
                });
            } 
        }else{
            if(!this.state.reserve_done && !this.state.full){
                fire.database().ref('/order').push({
                    id: getQueryStringObject().id,
                    name: getQueryStringObject().name,
                    key: this.state.users[this.state.my_id].key
                });
                this.setState({
                    reserve_done: true
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
        }
    }

    add = () => {
        if(!this.state.now){
            if (this.state.start_status !== 0){
                fire.database().ref('add').push({
                    id: this.state.my_id,
                });
            } 
        }
    }

    subtract = () => {
        if(!this.state.now){
            if (this.state.start_status !== 0){
                fire.database().ref('subtract').push({
                    id: this.state.my_id,
                });
                this.setState({
                    sub_clicked: 3
                }); 
                setTimeout(()=> {
                    this.setState({
                        sub_clicked: 0
                    }); 
                }, 2000);
            }
        }
    }

    setup = (p5, parent) => {
        p5.createCanvas(120, 120).parent(parent)
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
                p5.arc(60, 60, 120, 120, -Math.PI*0.5, diff/10-Math.PI*0.5);
                
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
                p5.stroke(255,0,0);
                p5.arc(60, 60, 120, 120, Math.PI*1.5-diff/10, Math.PI*1.5);
            }
        });
    }

    render(){
        const userTable = [...this.state.users];
        return (
            <div className = "UserPage">
                <div className = "div1">
                </div>
                <div className = "div2">
                </div>
                <div className = "div3">  
                </div>
                <div className="load-3" style = {{display: this.state.speech_status ? 'block' : 'none'}}>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
                <div className = "canvas" style = {{display: this.state.clock_status ? 'block' : "none"}}>
                    <Sketch setup={this.setup} draw={this.draw} />
                </div>
                {userTable.map((value, index) => {
                    if (value.name === getQueryStringObject().name){
                        return <MyUser 
                        key={index} 
                        state={value.state}
                        name="ME" 
                        top="20vh" 
                        left="85vw"
                        radius={value.radius}></MyUser>
                    } else {
                        return <MyUser 
                        key={index} 
                        state={value.state}
                        name={value.name} 
                        top={`${getRandomInt(50, 90)}vh`} 
                        left={`${getRandomInt(85, 95)}vw`}
                        radius={value.radius}></MyUser>
                    }
                })}
                <div className="clap" >
                    {this.state.add_status[this.state.add_status.length-1]}
                </div>
                <div className = "center_box">
                    {/* <div className = "heading">
                            회의 주제
                    </div> */}
                    <div className = "title">
                        주제: {this.state.topic}
                    </div>
                    {/* <div className = "running_time">
                        남은시간 : {this.state.runtime}
                    </div> */}
                    <div className="memo">
                        <input type="text" id="inp" placeholder="메모를 입력하세요."/>
                        <span className="border"></span>
                    </div>
                </div>
                
                <div className = "reserve_on" 
                style = {{display: ((this.state.reserve_done) || (this.state.t_full) || (this.state.now)) ? 'none' : 'block'}}
                onClick={this.reserve_on}>
                </div>
                <div className = "reserve_off" 
                style = {{display: ((!this.state.reserve_done) || (this.state.now)) ? 'none' : 'block'}} 
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
                <div className = "add" 
                style = {{display: this.state.now ? 'none' : 'block'}}
                onClick={this.add}>
                </div>
                <Message text= {"청자들이 충분히 이해한 것 같습니다."} state={this.state.sub_status} top={"-15%"}/>
                <Message text= {"화자에게 전달하였습니다."} state={this.state.sub_clicked} top={"-15%"}/>
            </div>
        );
    }
}

export default UserPage ;
