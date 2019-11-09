import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';


import { loadModels, getFacialExpressions, getFacialExpression } from '../api/face';
import { 
    initWebcamStream, 
    stopStream,
    getImageBlobFromStream
} from '../api/videoHelper';

import './EmotionCopycat.css';

import EmoCopyCatCard from '../components/EmoCopycatCard';



const IMG_TEST_URL = process.env.PUBLIC_URL + '/img/test.jpeg';
const PATH_TO_FACES = process.env.PUBLIC_URL + '/img/faces/';
const FACES_JSON = process.env.PUBLIC_URL + '/img/faces/faces.json';

// Initia state
const INIT_STATE = {
    loading: true,
    gameON: false,
    score: 0,
    faceURLs: null,
    faceURL: null,
    faceExpression: null,
    frameURL: null,
    frameExpression: null,
    streamInput: null,
    frameRate: 10,   // 40 = 25 frames per second (1000 = 1 fps)
}

const VIDEO_CONSTRAINS = {
    width: 350,
    height: 350,
    facingMode: 'user'
};

class EmotionCopycat extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INIT_STATE };
    }

    componentDidMount = async () => {
        this.setState({ loading: true });
        await this.getFacesFromJson();
        
        await loadModels();
        await this.warmUpFaceapi();

        this.setState({ loading: false });
        console.log('Ready to go!')
    }


// ----------------------------------------------------------
// -------------------- IMAGES LOAD Functions --------------------
// ----------------------------------------------------------

    async getFacesFromJson() {
        const response = await fetch(FACES_JSON);
        const jsonData = await response.json();
        this.setState({ faceURLs: jsonData.files });
        console.log('Got list of faces', this.state.faceURLs);
    }

    async setRandomFaceImg() {
        const items = await this.state.faceURLs;
        const item = await items[Math.floor(Math.random()*items.length)];
        const face_path = PATH_TO_FACES + item;
        // let imgURL = await this.cropImageToSquare(face_path);
        await  this.setState({ faceURL: face_path });
    }

    



// ----------------------------------------------------------
// -------------------- WEBCAM Functions --------------------
// ----------------------------------------------------------

    async getWebcamStream() {
        if (this.state.streamInput && this.state.streamInput.active) 
            return
        try {
            this.setState({
                streamInput: await initWebcamStream(VIDEO_CONSTRAINS)
            });
        } 
        catch (e) {
            console.log(e)
        }
    }

    stopWebcamStream() {
        if (!this.state.streamInput || !this.state.streamInput.active) {
            console.log('Can not stop the dead')
            return
        }
        stopStream(this.state.streamInput);
    }

    async captureWebcamFrame() {
        if (!this.state.streamInput || !this.state.streamInput.active) {
            console.log('Can not capture dead stream')
            return
        }

        try {
            const imgBlob = await getImageBlobFromStream(this.state.streamInput);
            const imgURL = await window.URL.createObjectURL(imgBlob);
            this.setState({ frameURL: imgURL });

            // get facial expressin
            const frameURL = this.state.frameURL;
            const expression = await this.getTopExpression(frameURL);
            this.setState({ frameExpression: expression });
        } catch(err) {
            console.log(err);
        }
    }

    async loopWebcamCapture() {
        if (!this.state.gameON) return;

        await this.captureWebcamFrame();
        setTimeout(this.loopWebcamCapture.bind(this), this.state.frameRate);
    }


// ----------------------------------------------------------
// -------------------- FACE-API Functions --------------------
// ----------------------------------------------------------

    warmUpFaceapi = async () => {
        const faceDesc = await getFacialExpression(IMG_TEST_URL);
    }

    async getTopExpression(imgURL) {
        // const faceURL = this.state.faceURL;
        const allExpressions = await getFacialExpression(imgURL);

        let expression = null;
        if (!allExpressions) return

        const expressions = Object.keys(allExpressions).map((key) => {
            const value = allExpressions[key];
            return value;
        })
        const max = Math.max(...expressions);
            
        expression = Object.keys(allExpressions).filter((key) => {
            return allExpressions[key] === max; 
        })[0];

        return expression;
    }



// ----------------------------------------------------------
// -------------------- GAME Functions --------------------
// ----------------------------------------------------------

    async onStartGame() {
        console.log('onStartGame()');
        await this.getWebcamStream();
        console.log('onStartGame()', this.state.streamInput)

        this.setState({ gameON: !this.state.gameON });

        // !! loopWebcamCapture() triggers only with state.gameON = true
        this.loopWebcamCapture();

        // set random face image from list
        await  this.setRandomFaceImg();
        // get facial expressin of image
        const faceURL = this.state.faceURL;
        const expression = await this.getTopExpression(faceURL);
        this.setState({ faceExpression: expression });
    }

    onExitGame() {
        console.log('onExitGame()');
        this.stopWebcamStream();
        this.setState({ gameON: !this.state.gameON });
    }

    async onResetImageBtn() {
        // set random face image from list
        await this.setRandomFaceImg();
        // get facial expressin of image
        const faceURL = this.state.faceURL;
        const expression = await this.getTopExpression(faceURL);
        this.setState({ faceExpression: expression });
    }


// ----------------------------------------------------------
// -------------------- RENDER Functions --------------------
// ----------------------------------------------------------

    gameOffMode() {
        return (
            <div>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Button variant="success" size="lg" active
                            onClick={this.onStartGame.bind(this)}
                        >
                            Start Game
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }

    gameOnMode() {
        return (
            <div>                
                <Row>
                    <Col>
                        <Button variant="danger" 
                            onClick={this.onExitGame.bind(this)} 
                        >
                            X
                        </Button>
                    </Col>
                    <Col>
                        <h2>Score: {this.state.score}</h2>
                    </Col>
                    <Col>
                        <Button 
                            variant="primary" 
                            onClick={this.onResetImageBtn.bind(this)}
                        >
                            ⟳
                        </Button>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <EmoCopyCatCard 
                            header = ""
                            imgURL = {this.state.frameURL}
                            mirrored = {true}
                            title = {this.state.frameExpression}
                        />
                    </Col>

                    <Col>
                        <EmoCopyCatCard 
                            header = "Copy Me"
                            imgURL = { this.state.faceURL }
                            title = { this.state.faceExpression }
                        />
                    </Col>
                </Row>

            </div>
        );
    }

    render() {
        return (
            <div>
                <Container>
                    <Row>
                        <Col>
                            <h1>Emotion Copycat</h1>
                        </Col>
                    </Row>
                    
                    { this.state.gameON ? (
                        <div>
                            {this.gameOnMode()}
                        </div>
                    ) : (
                        <div>
                            {this.gameOffMode()}
                        </div>
                    ) }
                    
                </Container>
            </div>
        );
    }
}

export default withRouter(EmotionCopycat);