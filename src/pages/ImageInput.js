import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

// Initial State
const INIT_STATE = {
    imageURL: null,
    fullDesc: null
};

class ImageInput extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INIT_STATE };
    }

    handleFileChange = async event => {
        if (!event.target.files[0]) return;
        this.resetState();
        await this.setState({
            imageURL: URL.createObjectURL(event.target.files[0]),
            loading: true
        });
    }

    resetState = () => {
        this.setState({ ...INIT_STATE });
    }

    render() {
        return (
            <div>
                <p>Upload file to analyse</p>
                <input 
                    id="myFileUpload"
                    type="file"
                    onChange={this.handleFileChange}
                    accept=".jpg, .jpeg, .png"
                />
                { this.state.imageURL ? (
                    <img src={this.state.imageURL} alt="imageURL" />
                ) : null }
            </div>
        );
    }

}

export default withRouter(ImageInput);