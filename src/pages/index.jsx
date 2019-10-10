import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';
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

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0,
            name: '',
            save_state: false
        };
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    create = (e) => {
        e.preventDefault();
        fire.database().ref().child('user_count').once('value').then(snapshot => {
            this.setState({
                id: snapshot.val()
            })
            fire.database().ref('/data/'+snapshot.val()).set({
                id: snapshot.val(),
                name: this.state.name,
                color: getRandomColor(),
                time: 0,
                penalty: 0 
            });
            let user_count = snapshot.val()+1;
            fire.database().ref().child('user_count').set(user_count);
            this.setState({
                save_state: true
            })
        });
    }

    render() {
        if (!this.state.save_state){
            return (
                <div>
                    <form onSubmit={e => this.create(e)}>
                        <label>
                            Name: 
                            <input
                                name='name'
                                value={this.state.name}
                                onChange={e => this.handleChange(e)}/>
                        </label>
                        <button className="button" type="submit" >Save </button> 
                    </form>
                </div>
            );
        } else {
            return (
                <div>
                    <Link className="go" to={`./user?id=${this.state.id}&name=${this.state.name}`}>
                        {this.state.name}, Let's go to the Meeting room!
                    </Link>
                </div>
            );
        }
        
    }
}

const MainPage = () => {
    return (
        <div className = "MainPage">
            <h1>MDNG's project</h1>
            <Form></Form>
        </div>  
    );
}

export default MainPage ;
