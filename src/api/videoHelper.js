// !!! throws an error when grabFrameFromStream() 
// and takePhotoFromStream() invoked after each other


export async function initWebcamStream(videoConstraints, withAudio = false) {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            // video: this.state.videoConstraints,
            video: videoConstraints,
            audio: withAudio
        });

        return mediaStream;
    } 
    catch (err) {
        console.log(err)
    }
}

export function stopStream(stream) {
    try {
        stream.getTracks().forEach(track => track.stop());
    } catch(err) {
        console.log(err)
    }
}

export async function initImageCaptureFromTrack(track) {
    try {
        const imageCapture = new ImageCapture(track);
        return imageCapture;
    } catch (err) {
        console.log(err);
    }
}

export async function grabFrameFromStream(mediaStream, trackIndex = 0) {
    try {
        // console.log('grabFrameFromStream()', mediaStream)
        // console.log('grabFrameFromStream()', mediaStream.getVideoTracks()[trackIndex])
        const track = mediaStream.getVideoTracks()[trackIndex];
        const imageCapture = new ImageCapture(track);
        const imageBitmap = await imageCapture.grabFrame()
        return imageBitmap;
    } catch (err) {
        console.log(err);
    }
}

export async function takePhotoFromStream(mediaStream, trackIndex = 0) {
    try {
        // console.log('takePhotoFromStream()', mediaStream)
        // console.log('takePhotoFromStream()', mediaStream.getVideoTracks()[trackIndex])
        const track = mediaStream.getVideoTracks()[trackIndex];
        const imageCapture = new ImageCapture(track);
        const imageBlob = await imageCapture.takePhoto()
        const imageBitmap = await createImageBitmap(imageBlob)
        return imageBitmap
    } catch(err) {
        console.log(err)
    }
}

export async function getImageBlobFromStream(mediaStream, trackIndex = 0) {
    try {
        const track = mediaStream.getVideoTracks()[trackIndex];
        const imageCapture = new ImageCapture(track);
        const imageBlob = await imageCapture.takePhoto();
        return imageBlob
    } catch(err) {
        console.log(err)
    }
}

