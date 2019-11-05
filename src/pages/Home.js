import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Home extends Component {
    render() {
        return (
            <div>
                <h2>Facial Expression Recognition</h2>
                <li>
                    <Link to='/photo'>Photo Input</Link>
                </li>
                <li>
                    <Link to='/camera'>Video Camera</Link>
                </li>
                <li>
                    <Link to='/copycat'>Emotion Copycat</Link>
                </li>
            </div>
        );
    }
}
