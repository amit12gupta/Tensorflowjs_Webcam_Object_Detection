import React from "react";
import ReactDOM from "react-dom";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./styles.css";

var offers = {'apple': ': no offers', 'banana': ': no offers', 'backpack': ': flat 5% off', 'book': ": rent book at $1",
              "bottle": ": flat 20% off", "bowl": ": flat 20% off", "cell phone": ": flat 45% off", "chair": ": flat 45% off",
              "clock": ": flat 45% off", "cup": ": flat 45% off", 'fork': ": save $2", "hair drier": ": flat 45% off",
              'handbag': ": upto 18% off",  'keyboard': ": save 10 USD", 'knife': ": no offers", 'laptop': ': flat 30% off',
              'mouse': ": get 2% off", 'remote': ": flat 15% off with Citi", 'scissors': ": flat 15% off with Citi",
              'spoon': ": save $5",  'teddy bear': ": get $5 on BOA card", 'tie': ": buy 2 get 1", 'umbrella': ": save $5"}

class App extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();

  async componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = await navigator.mediaDevices.getUserMedia({
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
      const modelPromise = cocoSsd.load();
      
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
          //alert("Camera setup error")
        });
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      if (prediction.class in offers) {      
            const x = prediction.bbox[0]
            const y = prediction.bbox[1]
            const width = prediction.bbox[2]
            const height = prediction.bbox[3]
            console.log('match: ', prediction.class)
            // Draw the bounding box.
            ctx.strokeStyle = "#00FFFF"
            ctx.lineWidth = 4
            /ctx.strokeRect(x, y, width, height)
            // Draw the label background. 
            ctx.fillStyle = "#00FFFF"
            const textWidth = ctx.measureText(prediction.class + ": " + Math.round(prediction.score*100 , 2) + "%").width;
            const textHeight = parseInt(font, 10) // base 10
            ctx.fillRect(x, y, textWidth + 4, textHeight + 4) //}
      }
    });

    predictions.forEach(prediction => {
      if (prediction.class in offers) {     
          const x = prediction.bbox[0];
          const y = prediction.bbox[1];
          // Draw the text last to ensure it's on top.
          ctx.fillStyle = "#000000";
          ctx.fillText(prediction.class + ": " + Math.round(prediction.score*100 , 2) + "%", x, y);
       }
    });
  };

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="800"
          height="600"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="800"
          height="600"
        />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
