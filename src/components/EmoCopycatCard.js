// props can include:
// header
// imgURL
// mirrored = false     - mirror the image or not
// title 
// text


import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Figure from 'react-bootstrap/Figure';

// import './EmoCopycatCard.css';



export default class EmoCopycatCard extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }

    // async cropImageToSquare(imgURL) {
    //     console.log('cropImageToSquare(): initial imgURL', imgURL);
    //     let img = new Image();
    //     img.src = imgURL;
    //     img.onload = async () => {
    //         // imgHeights[imgUrl] = img.height;
    //         // console.log('cropImageToSquare()', img.height, img.width);

    //         const elem = document.createElement('canvas');
    //         elem.width = img.width;
    //         elem.height = img.height;
    //         const context = elem.getContext('2d');
    //         // img.width and img.height will contain the original dimensions
    //         context.drawImage(img, 50, 0, img.width, img.height);
    //         // let imgData = context.getImageData(0, 0, img.width, img.height);
    //         // console.log('cropImageToSquare()', imgData);
    //         let imgOUT = this.convertCanvasToImage(elem);
    //         console.log(imgOUT)
    //         // context.canvas.toBlob((blob) => {
    //         //     const file = new File([blob], fileName, {
    //         //         type: 'image/jpeg',
    //         //         lastModified: Date.now()
    //         //     });
    //         // }, 'image/jpeg', 1);

    //         // const imgBlob = elem.toBlob()
    //         // const imageUrl = await window.URL.createObjectURL(imgBlob);
    //         // const imageUrl = elem.toDataURL();
    //         // console.log(imageUrl);
    //     }
    //     return imgURL;
    // }

    // // Converts canvas to an image
    // convertCanvasToImage(canvas) {
    //     var image = new Image();
    //     image.src = canvas.toDataURL("image/png");
    //     return image;
    // }

    render() {

        let { header, imgURL, title, text, mirrored } = this.props;

        const mirrorImage_style = {
            transform: 'scaleX(-1)'
            // transform: 'rotateY(180deg)'
        }

        // let img = new Image(300, 300);
        // img.src = this.props.imgURL;
        // img.onload = () => {
        //     const ratio = img.width / img.height;
        //     // console.log('EmoCopycatCard', img.height);
        //     console.log('EmoCopycatCard', ratio, img);
        // }

        // console.log('EmoCopycatCard: ', this.refs.imagePlacer);

        // let imgURLsquare = this.cropImageToSquare(imgURL);

        return (
            <div>
                <Card>
                    { header ? (
                        <Card.Header>{header}</Card.Header>
                    ) : null}

                    <Card.Body>
                        <Figure >
                            { mirrored ? (
                                <Figure.Image 
                                    // width={171}
                                    // height={180}
                                    style={mirrorImage_style}
                                    fluid={true}
                                    rounded={true}
                                    alt="image"
                                    src={imgURL}
                                />
                            ) : (
                                <Figure.Image 
                                    // width={171}
                                    // height={180}
                                    fluid={true}
                                    rounded={true}
                                    alt="image"
                                    src={imgURL}
                                />
                            )}

                            {/* <Figure.Image 
                                ref="imagePlacer"
                                style={{
                                    objectFit: 'cover',
                                    width: '300px',
                                    height: '300px',
                                  }}
                                // width={171}
                                // height={180}
                                fluid
                                rounded
                                alt="image"
                                src={imgURL}
                            /> */}
                        </Figure>
                        <Card.Title>{title}</Card.Title>
                        <Card.Text>
                            {text}
                        </Card.Text>
                        {/* <Button variant="primary">Go somewhere</Button> */}
                    </Card.Body>
                </Card>
            </div>
        );
    }
}