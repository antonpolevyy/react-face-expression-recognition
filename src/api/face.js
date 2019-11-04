import * as faceapi from 'face-api.js';

const maxDescriptorDistance = 0.5;

// Load models and weights
export async function loadModels() {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    .then(console.log('faceapi.loadTinyFaceDetectorModel is done'));
    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)
    .then(console.log('faceapi.loadFaceLandmarkTinyModel is done'));
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
    .then(console.log('faceapi.loadFaceRecognitionModel is done'));


    await faceapi.loadFaceExpressionModel(MODEL_URL)
    .then(console.log('faceapi.loadFaceExpressionModel is done'));
}

export async function getFullFaceDescription(imgBlob, inputSize = 512) {
    // tiny_face_detector_options
    let scoreThreshold = 0.5;
    const OPTION = new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold
    });
    const useTinyModel = true;

    // fetch image to api
    let img = await faceapi.fetchImage(imgBlob);
    console.log('faceapi input is ', img)

    // detect all faces an general full description from image
    // including landmark and descriptor of each face
    let fullDesc = await faceapi
        .detectAllFaces(img, OPTION)
        .withFaceLandmarks(useTinyModel)
        .withFaceExpressions()
    
    console.log('face.js fullDesc', fullDesc);

    return fullDesc;    
} 
