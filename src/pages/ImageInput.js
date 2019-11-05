import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { loadModels, getFullFaceDescription } from '../api/face'

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

    componentDidMount = async () => {
        await loadModels();
        // this.setState({ faceMatcher: await createMatcher(JSON_PROFILE) });
        // await this.handleImage(this.state.imageURL);
    }

    handleImage = async (image = this.state.imageURL) => {
        await getFullFaceDescription(image).then(fullDesc => {
            console.log(fullDesc);
            // this.setState({ fullDesc });
            // if (!!fullDesc) {
            //     this.setState({
            //         fullDesc,
            //         detections: fullDesc.map(fd => fd.detection),
            //         descriptors: fullDesc.map(fd => fd.descriptor)
            //     });
            // }
        });

    }

    handleFileChange = async event => {
        if (!event.target.files[0]) return;
        this.resetState();
        await this.setState({
            imageURL: URL.createObjectURL(event.target.files[0]),
            loading: true
        });

        this.handleImage();
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