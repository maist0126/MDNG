import React, {useEffect} from 'react';
import {useSpring, animated} from 'react-spring';
import "./user.css"
import fire from './fire';



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

class CanvasComponent extends React.Component {
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    updateCanvas() {
        const ctx = this.refs.canvas.getContext('2d');
        let cw = undefined;
        const start = Math.PI*3/2;
        const r = cw/2;
        const strokeWeight = r;
        const remainSec = 60;
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
        
                let diff = ((snapshot.val().time/remainSec)*Math.PI*2*10).toFixed(2);
                if (ctx !== undefined){
                    ctx.clearRect(0,0,cw,cw);
                    ctx.lineWidth = strokeWeight;
                    ctx.fillStyle = "#09F";
                    ctx.strokeStyle = "#09F";
                    ctx.beginPath();
                    ctx.arc(r, r, r - strokeWeight/2, start, diff/10+start, false);
                    ctx.stroke();
                }
                
            } else {
                let red_indicator = snapshot.val().time * (-1);
                let minutes = Math.floor((red_indicator % (60 * 60)) / 60);
                let seconds = Math.floor(red_indicator % 60);
                let m = "- " + minutes + ":" + seconds; 
                // document.getElementById("user_blue_time").innerHTML = m;
                // document.getElementById("user_blue_time").style.color = '#ff0000';
        
                let diff = ((red_indicator/remainSec)*Math.PI*2*10).toFixed(2);
                if (ctx !== undefined){
                    ctx.clearRect(0,0,cw,cw);
                    ctx.lineWidth = strokeWeight;
                    ctx.fillStyle = "#09F";
                    ctx.strokeStyle = "#09F";
                    ctx.beginPath();
                    ctx.arc(r, r, r - strokeWeight/2, start, diff/10+start, false);
                    ctx.stroke();
                }
            }
        });
    }
    render() {
         return (
             <canvas ref="canvas" style ={{
                position: 'absolute',
                top: '50%',
                left: '15%',
                transform: 'translate(-50%,-50%)'
             }}width={300} height={300}/>
         );
    }
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

        if (propps.radius === 2){
            set({ width: '60px', height: '60px'});
        } else if (propps.radius === 1){
            set({ width: '40px', height: '40px'});
        } else if (propps.radius === 0){
            set({ width: '50px', height: '50px'});
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
            now_id: undefined,
            now: false,
            reservers: []
        }
    }
    componentDidMount() {
    }

    componentWillMount() {
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
                    radius: 0
                });
            }
            speech_mean = (speech_mean/userTable.length).toFixed(2);
            let high_mean = speech_mean*2;
            let low_mean = speech_mean*0.5;
            for (let i = 0; i<userTable.length; i++){
                if (userTable[i].time > high_mean){
                    userTable[i].radius = 2;
                } else if (userTable[i].time < low_mean){
                    userTable[i].radius = 1;
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
                    radius: 0
                });
            }
            speech_mean = (speech_mean/userTable.length).toFixed(2);
            let high_mean = speech_mean*2;
            let low_mean = speech_mean*0.5;
            for (let i = 0; i<userTable.length; i++){
                if (userTable[i].time > high_mean){
                    userTable[i].radius = 2;
                } else if (userTable[i].time < low_mean){
                    userTable[i].radius = 1;
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
                    <div>
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
                <CanvasComponent/>
            </div>
            
        );
    }
}

export default UserPage ;
