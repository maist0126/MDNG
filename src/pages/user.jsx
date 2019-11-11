import React from 'react';
import "./user.css"
import fire from './fire';
import MyUser from './Myuser';
import Message from './Message';
import Like from './Like';
import Sketch from "react-p5";
import nowtext from "./img/NOW.png";
import nexttext from "./img/NEXT.png";
import queuetext from "./img/QUEUE.png";
import canceltext from "./img/CANCEL.png";
import quittext from "./img/QUIT.png";

import clap from './img/clap.png';
import ok from './img/ok.png';

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
                radius: 0,
                graph: 0
            }],
            my_id: getQueryStringObject().id,
            reserve_done: false,
            full: false,
            t_full: false,
            now: false,
            reservers: [],
            reservers_status: false,
            runtime: undefined,
            clock_status: false,
            add_status: [],
            sub_status: 0,
            start_status: 0,
            speech_status: false,
            sub_clicked: 0,
            rem_time: 0
        }
    }
    
    componentDidMount() {
        firelistener("mst_time","value", snapshot => {
            let time = 3600 - snapshot.val().time;
            let minutes = Math.floor((time % (60 * 60)) / 60);
            let seconds = Math.floor(time % 60);
            let m = minutes + "m " + seconds + "s" ;
            this.setState({ runtime: m });
        });
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
            let worst = [];
            // sort by value
            let aa = 0;
            for (let key in snapshot.val()){
                worst.push({id: snapshot.val()[key].id, value: snapshot.val()[key].time});
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
            worst.sort(function (a, b) {
                if(a.hasOwnProperty('value')){
                    return a.value - b.value;
                }
            });
            for (let i = 0; i<userTable.length; i++){
                userTable[i].graph = (userTable[i].time/worst[worst.length-1].value).toFixed(2);
                if (userTable[i].id === worst[0].id){
                    userTable[i].radius = 3;
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
            let worst = [];
            for (let key in userTable){
                worst.push({id: userTable[key].id, value: userTable[key].time});
            }
            worst.sort(function (a, b) {
                if(a.hasOwnProperty('value')){
                    return a.value - b.value;
                }
            });
            for (let i = 0; i<userTable.length; i++){
                userTable[i].graph = (userTable[i].time/worst[worst.length-1].value).toFixed(2);
                if (userTable[i].id === worst[0].id){
                    userTable[i].radius = 3;
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
                    t_full: false,
                    reservers_status: true
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
            } else{
                this.setState({
                    reservers_status: false
                });
                
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
                reservers: reservers_id,
                reservers_status: true });
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
                    t_full: false,
                    reservers_status: true
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
            }  else{
                this.setState({
                    reservers_status: false
                });
                
            }
            this.setState({ 
                users: userTable,
                reservers: reservers_id  });
        });
        fire.database().ref("add").on('child_added', snapshot => {
            if(this.state.start_status !== 0){
                let likes = [...this.state.add_status];
                likes.push(<Like key = {`${getRandomInt(0, 1000)}`}></Like>);
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
        fire.database().ref().child('rem_time').on('value', snapshot => {
            this.setState({
                rem_time: snapshot.val().time
            });
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
        p5.createCanvas(28.5*window.innerWidth/100, 28.5*window.innerWidth/100).parent(parent)
    }
    
    draw = p5 => {
        let time = this.state.rem_time;
        if (time > 0){
            let minutes = Math.floor((time % (60 * 60)) / 60);
            let seconds = Math.floor(time % 60);
            let m = minutes + ":" + seconds ; 
            // if (seconds < 15){
            //     document.getElementById("user_blue_time").innerHTML = m;   
            // } else{
            //     document.getElementById("user_blue_time").innerHTML = ""; 
            // }
            // document.getElementById("user_blue_time").style.color = '#ffffff';
    
            let diff = ((time/60)*Math.PI*2*10).toFixed(2);
            p5.background(255);
            p5.strokeWeight(3*window.innerHeight/100);
            p5.stroke(0,153,255);
            p5.arc(14.25*window.innerWidth/100, 14.25*window.innerWidth/100, 40*window.innerHeight/100, 40*window.innerHeight/100, -Math.PI*0.5, diff/10-Math.PI*0.5);
            
        } else {
            let red_indicator = time * (-1);
            let minutes = Math.floor((red_indicator % (60 * 60)) / 60);
            let seconds = Math.floor(red_indicator % 60);
            let m = "- " + minutes + ":" + seconds; 
            // document.getElementById("user_blue_time").innerHTML = m;
            // document.getElementById("user_blue_time").style.color = '#ff0000';
    
            let diff = ((red_indicator/60)*Math.PI*2*10).toFixed(2);
            p5.background(255);
            p5.strokeWeight(3*window.innerHeight/100);
            p5.stroke(255,0,0);
            p5.arc(14.25*window.innerWidth/100, 14.25*window.innerWidth/100, 40*window.innerHeight/100, 40*window.innerHeight/100, Math.PI*1.5-diff/10, Math.PI*1.5);
        }
    }

    render(){
        const userTable = [...this.state.users];
        return (
            <div className = "UserPage">
                <div className = "div1">
                    <img className = "nowtext" src= {nowtext}></img>
                </div>
                <div className = "div2">
                    <img className = "nexttext" src= {nexttext}></img>
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
                        id={value.id}
                        state={value.state}
                        name={"ME"} 
                        top={`${value.id%2*(-22)+85}vh`} 
                        left={`${value.id*8+37}vw`}
                        radius={value.radius}></MyUser>
                    } else {
                        return <MyUser 
                        key={index} 
                        id={value.id}
                        state={value.state}
                        name={" "} 
                        top={`${value.id%2*(-22)+85}vh`} 
                        left={`${value.id*8+37}vw`}
                        radius={value.radius}></MyUser>
                    }
                })}
                <div className="clap" >
                    {this.state.add_status[this.state.add_status.length-1]}
                </div>
                <div className = "center_box">
                    <div className = "running_time">
                        Time left : {this.state.runtime}
                    </div>
                    <div className="memo2">
                        <div className = "title">
                            {this.state.topic}
                        </div>
                        <textarea placeholder="Click to take a note."/>
                    </div>
                    {/* <div className="memo">
                        <input type="text" id="inp" placeholder="메모를 입력하세요."/>
                        <span className="border"></span>
                    </div> */}
                </div>
                <div className = "button_box"
                style = {{display: ((this.state.reserve_done) || (this.state.t_full) || (this.state.now)) ? 'none' : 'block'}}
                onClick={this.reserve_on}>
                    <img className = "queuetext" src= {queuetext}></img>
                </div>
                <div className = "button_box"
                style = {{display: ((!this.state.reserve_done) || (this.state.now)) ? 'none' : 'block'}} 
                onClick={this.reserve_off}>
                    <img className = "canceltext" src= {canceltext}></img>
                </div>
                <div className = "button_box"
                style = {{display: this.state.now ? 'block' : 'none'}}
                onClick={this.quit}>
                    <img className = "quittext" src= {quittext}></img>
                </div>
                <div className = "graph_box">
                    <div className="graph_wrapper">
                        {userTable.map((value, index) => {
                            if (value.name === getQueryStringObject().name){
                                return <div className="graph_unit" key={index} >
                                            <div className="graph" style={{height: `${value.graph*10}vh`}}></div>
                                            <div className="g_name">ME</div>
                                        </div>
                            } else {
                                return <div className="graph_unit" key={index} >
                                <div className="graph" style={{backgroundColor: "#d9d9d9", height: `${value.graph*10}vh`}}></div>
                                <div className="g_name"></div>
                            </div>
                            }
                        })}
                    </div>
                </div>
                <img src = {ok} className = "ok_button_1" style = {{display: ((this.state.now) && (this.state.sub_status > 0)) ? 'block' : 'none'}} alt ="ok" />
                <img src = {ok} className = "ok_button_2" style = {{display: ((this.state.now) && (this.state.sub_status > 1)) ? 'block' : 'none'}} alt ="ok" />
                <img src = {ok} className = "ok_button_3" style = {{display: ((this.state.now) && (this.state.sub_status > 2)) ? 'block' : 'none'}} alt ="ok" />

                <div className = "subtract_" 
                style = {{display: ((this.state.now) || (!this.state.reservers_status)) ? 'none' : 'block'}}>
                </div>
                <img src = {ok} className = "ok_button" style = {{display: ((this.state.now) || (!this.state.reservers_status)) ? 'none' : 'block'}} alt ="ok" />
                <div className = "subtract" 
                style = {{display: ((this.state.now) || (!this.state.reservers_status)) ? 'none' : 'block'}}
                onClick={this.subtract}>
                </div>
                <div className = "add_" 
                style = {{display: ((this.state.now) || (!this.state.reservers_status)) ? 'none' : 'block'}}>
                </div>
                <img src = {clap} className = "clap_button" style = {{display: ((this.state.now) || (!this.state.reservers_status)) ? 'none' : 'block'}} alt ="clap" />
                <div className = "add" 
                style = {{display: ((this.state.now) || (!this.state.reservers_status)) ? 'none' : 'block'}}
                onClick={this.add}>
                </div>
                <Message text= {"Successfully delivered to the speaker."} state={this.state.sub_clicked} top={"-15%"}/>

            </div>
        );
    }
}

export default UserPage ;
