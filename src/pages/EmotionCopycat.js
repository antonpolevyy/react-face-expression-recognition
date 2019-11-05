import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import { 
    initWebcamStream, 
    stopStream,
    getImageBlobFromStream
} from '../api/videoHelper';

import './EmotionCopycat.css'



// const IMG_TEST_URL = process.env.PUBLIC_URL + '/img/test.jpeg';
const PATH_TO_FACES = process.env.PUBLIC_URL + '/img/faces/';
const FACES_JSON = process.env.PUBLIC_URL + '/img/faces/faces.json';

// Initia state
const INIT_STATE = {
    loading: true,
    gameON: false,
    score: 0,
    faceURL: null,
    faceURLs: null,
    frameURL: null,
    streamInput: null,
    frameRate: 20,   // 40 = 25 frames per second (1000 = 1 fps)
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
        
        // await loadModels();
        // await this.warmUpFaceapi();
        this.setState({ loading: false });
        console.log('Ready to go!')
    }


    async getFacesFromJson() {
        const response = await fetch(FACES_JSON);
        const jsonData = await response.json();
        this.setState({ faceURLs: jsonData.files });
        console.log('Got list of faces', this.state.faceURLs);
    }

    setRandomFaceImg() {
        const items = this.state.faceURLs;
        const item = items[Math.floor(Math.random()*items.length)];
        const face_path = PATH_TO_FACES + item;
        this.setState({ faceURL: face_path });
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
        this.setRandomFaceImg();
    }

    onExitGame() {
        console.log('onExitGame()');
        this.stopWebcamStream();
        this.setState({ gameON: !this.state.gameON });
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
                    <Col md={4}>
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
                        <Button variant="primary" onClick={this.setRandomFaceImg.bind(this)} >
                            ⟳
                        </Button>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Card>
                            <div className="mirror">
                                <Card.Img variant="top" src={this.state.frameURL} alt="Webcam Stream" />
                            </div>
                            <Card.Body>
                                <Card.Text>
                                    Try to make the same facial expression
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col>
                        <Card>
                            <Card.Img variant="top" src={this.state.faceURL} />
                            <Card.Body>
                                <Card.Title>Copy Me</Card.Title>
                                <Button variant="primary" disabled >? (meaning)</Button>
                            </Card.Body>
                        </Card>
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