import React, { useRef } from "react";

// tutorial: https://blog.cloudboost.io/using-html5-canvas-with-react-ff7d93f5dc76
// tutorial: https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

export class Clock extends React.Component {
    
    canvas;

    constructor(props) {
        super(props);
        this.canvas = React.createRef();
    }

    componentDidMount() {
   
        /** @type {CanvasRenderingContext2D} */
        const ctx = this.canvas.current.getContext('2d');

        // Set line width
        ctx.lineWidth = 10;

        // Wall
        ctx.strokeRect(75, 140, 150, 110);

        // Door
        ctx.fillRect(130, 190, 40, 60);

        // Roof
        ctx.beginPath();
        ctx.moveTo(50, 140);
        ctx.lineTo(150, 60);
        ctx.lineTo(250, 140);
        ctx.closePath();
        ctx.stroke();

    }

    render() {
        return <canvas ref={this.canvas} {...this.props} />
    }
}