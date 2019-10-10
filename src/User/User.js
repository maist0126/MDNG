import React from 'react';
import './user.css';

  
const user = (props) => {

    return (
        <div className="User" style={props.style} onClick={props.click}>
            <div className="User_name"> 
                {props.name}
            </div>
        </div>
    );
}

export default user ;
