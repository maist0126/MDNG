import React,{ Component } from 'react';
import './App.css';
import MainPage from './pages';
import UserPage from './pages/user';
import NotFoundPage from './pages/404';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';


class App extends Component {
  render(){
    return(
      <Router>
        <Switch>
          <Route exact path="/" component={MainPage} />
          <Route exact path="/user" component={UserPage} />
          <Route exact path="/404" component={NotFoundPage} />
          <Redirect to="/404" />
        </Switch>
      </Router>
    )
  }
}

export default App;
