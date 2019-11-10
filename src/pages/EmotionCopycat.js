import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
// import Card from 'react-bootstrap/Card';


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
    expressionsMatch: false,
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
        // await this.warmUpFaceapi();

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
        this.setState({ loading: true });
        this.setState({ gameON: true });
        console.log('onStartGame()');

        // warms up facial classification (as first classification after reload is slow)
        await this.warmUpFaceapi();

        await this.getWebcamStream();
        console.log('onStartGame()', this.state.streamInput);

        this.setState({ loading: false });

        // !! loopWebcamCapture() triggers only with state.gameON = true
        this.loopWebcamCapture();

        // set random face image from list
        await  this.setRandomFaceImg();
        // get facial expressin of image
        const faceURL = this.state.faceURL;
        const expression = await this.getTopExpression(faceURL);
        this.setState({ faceExpression: expression });

        // check if face expressions in Webcam and exemple image are matching
        this.loopUpdateExpressionsMatch();
    }

    onExitGame() {
        console.log('onExitGame()');
        this.stopWebcamStream();
        this.setState({ gameON: false });
    }

    async onResetImageBtn() {
        // set random face image from list
        await this.setRandomFaceImg();
        // get facial expressin of image
        const faceURL = this.state.faceURL;
        const expression = await this.getTopExpression(faceURL);
        this.setState({ faceExpression: expression });
    }

    updateExpressionsMatch() {
        const { faceExpression, frameExpression } = this.state;

        if (!faceExpression || !frameExpression) return

        if (faceExpression == frameExpression){
            console.log('match', faceExpression)
            this.setState({ expressionsMatch: true });
        } else {
            console.log('no match')
            this.setState({ expressionsMatch: false });
        }
    }

    loopUpdateExpressionsMatch() {
        if (!this.state.gameON) return;

        this.updateExpressionsMatch();
        setTimeout(this.loopUpdateExpressionsMatch.bind(this), this.state.frameRate);
    }

// ----------------------------------------------------------
// -------------------- GAME RENDER Functions --------------------
// ----------------------------------------------------------

    gameOffMode() {
        return (
            <div>
                <Container className="h-100">
                    <Row className="align-items-start">
                        <Col>
                            <h1>Emotion Copycat</h1>
                        </Col>
                    </Row>
                    <Row className="h-50" >
                        <Col className="h-100 d-table">
                            <Button 
                                ref="startGameButton"
                                className="d-table-cell align-middle"
                                variant="success" 
                                size="lg" 
                                active
                                onClick={this.onStartGame.bind(this)}
                                disabled={this.state.gameON}
                            >
                                {this.state.gameON ? (
                                    <div>
                                        <Spinner
                                            as="span"
                                            animation="grow"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        Loading...
                                    </div>
                                ) : (
                                    <div>
                                        Start Game 
                                    </div>
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Container>
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
                            style={{
                                // position: 'fixed',
                                position: 'absolute',
                                top: 0,
                                left: '15px'
                            }}
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
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: '15px'
                            }} 
                        >
                            ⟳
                        </Button>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <EmoCopyCatCard 
                            header = "Flex Your Face"
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


// ----------------------------------------------------------
// -------------------- RENDER Functions --------------------
// ----------------------------------------------------------

    render() {
        return (
            <div>
                <Container>
                    { this.state.gameON && !this.state.loading ? (
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