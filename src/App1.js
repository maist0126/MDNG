import React,{ Component } from 'react';
import './App.css';
import User from './User/User.js';
import { useGesture } from 'react-with-gesture'

import {useSpring, animated} from 'react-spring'


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

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
function Drag() {
  const [bind, { local }] = useGesture()
  const [x, y] = local
  return <div {...bind()} style={{ position: 'absolute',
  // top: `${getRandomInt(50, 95)}%`,
  // left: `${getRandomInt(85, 95)}%`,
  // transform: 'translate(-50%,-50%)',
  backgroundColor: getRandomColor(),
  width: '75px',
  height: '75px',
  borderRadius: '50%',
  transform: `translate3d(${x}px,${y}px,0)` }} />
}

function Myuser() {
  let toggle = true;
  const [props, set] = useSpring(() => ({
      position: 'absolute',
      top: '20%',
      left: '85%',
      transform: 'translate(-50%,-50%)',
      backgroundColor: getRandomColor(),
      width: '75px',
      height: '75px',
      borderRadius: '50%'
     }))
  return (
      <animated.div
          className="User"
          style={props}
          onClick={() => {
            set({ top: toggle ? '20%' : '50%' , left: toggle ? '38%' : '15%'});
            toggle = false;
          }}>
          <div className="User_name"> 
              MDNG
          </div>
      </animated.div>
  )
}

function User(propps) {
  return (
      <div className="User" style={propps.style} onClick={propps.click}>
          <div className="User_name"> 
              {propps.name}
          </div>
      </div>
  );
}

class App extends Component {
  render(){
    
    let user2_style = {
      position: 'absolute',
      top: `${getRandomInt(50, 90)}%`,
      left: `${getRandomInt(85, 95)}%`,
      transform: 'translate(-50%,-50%)',
      backgroundColor: getRandomColor(),
      width: '75px',
      height: '75px',
      borderRadius: '50%'
    };

    let user3_style = {
      position: 'absolute',
      top: `${getRandomInt(50, 95)}%`,
      left: `${getRandomInt(85, 95)}%`,
      transform: 'translate(-50%,-50%)',
      backgroundColor: getRandomColor(),
      width: '75px',
      height: '75px',
      borderRadius: '50%'
    };

    let user4_style = {
      position: 'absolute',
      top: `${getRandomInt(50, 90)}%`,
      left: `${getRandomInt(85, 95)}%`,
      transform: 'translate(-50%,-50%)',
      backgroundColor: getRandomColor(),
      width: '75px',
      height: '75px',
      borderRadius: '50%'
    };
    
    
    return(
      <div className="App">
        <div className = "div1">
          
        </div>
        <div className = "div2">
          <div className = "center_box">
            <div className = "heading">
                회의 주제
            </div>
            <div className = "title">
                졸업 전시 후원을 위한 아이디어 회의
            </div>
          </div>
        </div>
        <div className = "div3">
          
        </div>
        <Myuser />
        <Drag />
        <User style = {user2_style} name = {'YONI'}/>
        <User style = {user3_style} name = {'YES'}/>
        <User style = {user4_style} name = {'No'}/>
      </div>
    )
  }
}

export default App;
