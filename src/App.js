import React, { Component } from 'react';
import { Route, Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import './App.css';

import Home from './pages/Home';
import ImageInput from './pages/ImageInput';
import CameraInput from './pages/CameraInput';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Router history={ createBrowserHistory({ basename: process.env.PUBLIC_URL }) }>
          <Route exact path='/' component={ Home } />
          <Route exact path='/photo' component={ ImageInput } />
          <Route exact path='/camera' component={ CameraInput } />
        </Router>
      </div>
    );
  }
}

