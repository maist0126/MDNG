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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0,
            name: '',
            save_state: 0
        };
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    create = (e) => {
        e.preventDefault();
        let key = fire.database().ref('/data/').push({
            name: this.state.name,
            color: getRandomColor(),
            time: 0,
            penalty: 0
        }).key;
        this.setState({
            save_state: 1
        })
        fire.database().ref('/data/').once('value').then(snapshot => {
            let i = 0;
            let j = 0;
            for (let y in snapshot.val()){
                if (key === Object.keys(snapshot.val())[j]){
                    i = j;
                    break;
                }
                j ++;
            }
            fire.database().ref('/data/'+key).set({
                id: i,
                name: this.state.name,
                color: getRandomColor(),
                time: 0,
                penalty: 0
            });
            this.setState({
                id: i,
                save_state: 2
            })
        })
    }

    render() {
        if (this.state.save_state == 0){
            return (
                <div>
                    <form onSubmit={e => this.create(e)}>
                        <div className="name_label">
                            Name: 
                        </div>
                        <label className="label">
                            <input
                                name='name'
                                value={this.state.name}
                                onChange={e => this.handleChange(e)}/>
                        </label>
                        <button className="button" type="submit" >Save </button> 
                    </form>
                </div>
            );
        } else if(this.state.save_state == 1) {
            return (
                <div>
                    Wait for seconds...
                </div>
            );
        } else{
            return (
                <div>
                    <Link className="go" to={`./user?id=${this.state.id}&name=${this.state.name}`}>
                        {this.state.name}, Let's go to the meeting!
                    </Link>
                </div>
            );
        }
        
    }
}

const MainPage = () => {
    return (
        <div className = "MainPage">
            <h1>Lewis</h1>
            <Form></Form>
        </div>  
    );
}

export default MainPage ;
