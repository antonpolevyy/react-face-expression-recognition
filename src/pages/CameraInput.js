import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { loadModels, getFullFaceDescription } from '../api/face';
import { 
    initWebcamStream, 
    stopStream,
    grabFrameFromStream,
    takePhotoFromStream,
    getImageBlobFromStream
} from '../api/videoHelper';
import { conv2dTranspose } from '@tensorflow/tfjs-core';

const IMG_TEST_URL = process.env.PUBLIC_URL + '/img/test.jpeg';

// Initial State
const INIT_STATE = {
    readyToGo: false,
    imageBitmap: null,
    // imageURL: null,
    fullDesc: null,
    streamInput: null,
    intervalRate: 100,
    intervalProcess: null
};

const VIDEO_CONSTRAINS = {
    // width: { min: 160, ideal: 350, max: 600 },
    // height: { min: 160, ideal: 350, max: 600 },
    width: 350,
    height: 350,
    facingMode: 'user'
};

class CamearInput extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INIT_STATE };
    }

    componentDidMount = async () => {
        await loadModels();
        await this.heatUpFaceapi();
        this.setState({ readyToGo: true });
        console.log('Ready to go!')
    }

    resetState = () => {
        this.setState({ ...INIT_STATE });
    }

    heatUpFaceapi = async () => {
        const faceDesc = await getFullFaceDescription(IMG_TEST_URL);
    }

    onGetUserMedia = async () => {
        if (this.state.streamInput && this.state.streamInput.active) {
            console.log('No need to re-start working stream');
            return
        }
        
        console.log('onGetUserMedia()')
        try {
            this.setState({
                streamInput: await initWebcamStream(VIDEO_CONSTRAINS)
            });
            this.refs.webcamInput.srcObject = this.state.streamInput;
        } 
        catch (e) {
            console.log(e)
        }
    }

    onStopWebcamInput = () => {
        if (!this.state.streamInput || !this.state.streamInput.active) {
            console.log('Can not stop the dead')
            return
        }
        stopStream(this.state.streamInput);
    }

    onGrabFrame = async () => {
        try {
            const imageBitmap = await grabFrameFromStream(this.state.streamInput);
            console.log('onGrabFrame()', imageBitmap)

            this.setState({ imageBitmap: imageBitmap })
            this.drawCanvas(this.refs.frameCanvas, imageBitmap);


            // // get full face description
            const canvas = this.refs.frameCanvas;
            const imgURL = canvas.toDataURL();
            const faceDescription = await getFullFaceDescription(imgURL);
            this.setState({ fullDesc: faceDescription })

        } catch(err) {
            console.log(err)
        }
    }

    onTakePhoto = async () => {
        try {
            const imageBitmap = await takePhotoFromStream(this.state.streamInput);
            console.log('onTakePhoto()', imageBitmap)
    
            this.drawCanvas(this.refs.frameCanvas, imageBitmap);

            // get full face description
            // const imgBlob = await getImageBlobFromStream(this.state.streamInput);
            const canvas = this.refs.frameCanvas;
            const imgURL = canvas.toDataURL();
            const faceDescription = await getFullFaceDescription(imgURL)
            console.log('processFrame()', faceDescription)

        } catch(err) {
            console.log(err);
        }
    }


    onProcessFrames() {
        const rate = this.state.intervalRate
        this.setState({
            intervalProcess: setInterval(this.processFrame.bind(this), rate)
        })
    }

    processFrame = async () => {
        // check if video stream is active
        if (!this.state.streamInput || !this.state.streamInput.active) {
            console.log('Stop the intervalProcess')
            clearInterval(this.state.intervalProcess)
            return
        }
        // capture a frame
        const imageBitmap = await grabFrameFromStream(this.state.streamInput);

        // // get full face description
        // const faceDescription = await getFullFaceDescription(imageBitmap)
        // console.log('processFrame()', faceDescription)

        // draw result in canvas
        this.drawCanvas(this.refs.frameCanvas, imageBitmap);
    }

    drawCanvas(canvas, img) {
        // console.log('drawCanvas(), img', img.width)
        canvas.width = getComputedStyle(canvas).width.split('px')[0];
        canvas.height = getComputedStyle(canvas).height.split('px')[0];
        // canvas.width = img.width;
        // canvas.height = img.height;
        // console.log('canvas.width-height: ', canvas.width, canvas.height)
        let ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
        let x = (canvas.width - img.width * ratio) / 2;
        let y = (canvas.height - img.height * ratio) / 2;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
            x, y, img.width * ratio, img.height * ratio);
    }

    getFaceExpression = (fullDesc) => {
        let expression = null;
        if (!fullDesc || !fullDesc[0] || !fullDesc[0].expressions)
            return;
        
        const copiedExpression = fullDesc[0].expressions;
        const expressions = Object.keys(copiedExpression).map((key) => {
            const value = copiedExpression[key];
            return value;
        })
        const max = Math.max(...expressions);
            
        expression = Object.keys(copiedExpression).filter((key) => {
            return copiedExpression[key] === max; 
        })[0];
        console.log(expression)

        return expression;
    }

    render() {
        return (
            <div>
                <h1>Camera Input</h1>

                {this.state.readyToGo ? (
                    <div>
                        <p>Ready to go!</p>
                        <p>Try "Start", then "Grab Frame"</p>
                    </div>
                ) : (
                    <p>Wait, Face recognition is not ready yet...</p>
                )}

                <div>
                    <video ref="webcamInput" autoPlay muted></video>
                    <button onClick={this.onGetUserMedia.bind(this)}>Start (Get User Media)</button>
                    <button onClick={this.onStopWebcamInput.bind(this)}>Stop</button>
                </div>

                {/* <div>
                    <video ref="videoOutput" autoPlay muted></video>
                    <button onClick={this.onProcessVideo.bind(this)}>Process Video</button>
                </div> */}
                <div>
                    <button onClick={this.onGrabFrame.bind(this)}>Grab Frame</button>
                    <button onClick={this.onTakePhoto.bind(this)}>Take Photo</button>
                    <button onClick={this.onProcessFrames.bind(this)}>Process Frames</button>
                </div>

                {this.state.fullDesc && this.state.fullDesc[0] ? (
                    <div>
                        <p>Face Emotion: {this.getFaceExpression(this.state.fullDesc)}</p>
                    </div>
                ) : null}

                <div>
                    <canvas ref="frameCanvas" width={VIDEO_CONSTRAINS.width} height={VIDEO_CONSTRAINS.height} />
                </div>
            </div>
        );
    }

}

export default withRouter(CamearInput);
