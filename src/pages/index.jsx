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
            user_count: 0,
            save_state: false
        };
    }

    componentWillMount() {
        fire.database().ref().child('user_count').on('value', snapshot => {
            this.setState({
                user_count: snapshot.val()
            })
        });
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    create = (e) => {
        e.preventDefault();
        let user_count = this.state.user_count;
        fire.database().ref('/data/'+user_count).set({
            id: user_count,
            name: this.state.name,
            color: getRandomColor(),
            time: 0,
            penalty: 0,
            radius: 4,
            state: 0
        });
        let new_user_count = user_count + 1;
        fire.database().ref().child('user_count').set(new_user_count);
        this.setState({
            id: user_count,
            save_state: true
        })
    }

    render() {
        if (!this.state.save_state){
            return (
                <div>
                    <form onSubmit={e => this.create(e)}>
                        <label className="label">
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
