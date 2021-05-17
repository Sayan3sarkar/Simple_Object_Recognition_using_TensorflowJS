import { Component, createRef } from "react";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./App.css";

class App extends Component {
  videoRef = createRef();
  canvasRef = createRef(); // Creating a ref for HTML Canvas Element

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      // Web cam Promise
      const webCam = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });

      // coco SSD object recognition model promise
      const model = cocoSsd.load();

      Promise.all([model, webCam])
        .then(values => {
          this.detectFrame(values[0], this.videoRef.current);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  /**
   * Method to detect video Frame
   * @param {*} video 
   * @param {*} model 
   */
  detectFrame = (model, video) => {
    model.detect(video).then(predictions => {
      this.displayPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(model, video);
      });
    });
  };


  /**
   * Method to display predictions on canvas
   * @param {*} predictions 
   */
  displayPredictions = predictions => {
    // Create a 2D canvas
    const ctx = this.canvasRef.current.getContext("2d");

    // clear the rectangle as a first step
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Define font options
    const font = "18px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      // Draw the surrounding rectangle.
      ctx.strokeStyle = "#1cb5ff";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      // Draw the label background.
      ctx.fillStyle = "#1cb5ff";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 5, textHeight + 5);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];

      // Draw the text
      ctx.fillStyle = "#000";
      ctx.fillText(prediction.class, x, y);
    });
  };

  render() {
    return (
      <div className="app">
        <video
          className="frameSize"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="600"
          height="500"
        />
        <canvas
          className="frameSize"
          ref={this.canvasRef}
          width="600"
          height="500"
        />
      </div>
    );
  }
}

export default App;
