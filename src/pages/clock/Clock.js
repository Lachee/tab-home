import React, { useRef } from "react";

// tutorial: https://blog.cloudboost.io/using-html5-canvas-with-react-ff7d93f5dc76
// tutorial: https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

export class Clock extends React.Component {

    /** @type {TimePiece} the current timepiece */
    timepiece;
    canvas;

    constructor(props) {
        super(props);
        this.canvas = React.createRef();
    }

    componentDidMount() {
        if (this.timepiece != null) {
            this.timepiece.detatch();
        }

        this.timepiece = new TimePiece(this.canvas.current);
    }

    render() {
        return <canvas  ref={this.canvas} {...this.props} style={{ background: 'white' }}/>
    }
}

class TimePiece {

    /** @type {HTMLCanvasElement} the current canvas */
    canvas;

    /** @type {CanvasRenderingContext2D} current context */
    ctx;

    /** current animation frame request id */
    _request = false;

    constructor(canvas = null) {
        if (cavnas)
            this.attach(canvas);
    }

    /** Renders a frame */
    renderFrame() {
        if (this.canvas == null)
            return; 

        // Queue the next frame
        this.queueFrame();
    }

    /** Queues the frame for rendering  */
    queueFrame() {
        if (this.canvas == null) 
            return false;
        return this._request = window.requestAnimationFrame(() => {
            this.renderFrame();
        });
    }

    attach(canvas) {
        if (canvas === null) 
            throw Error('Canvas is null. Did you mean detatch()?');
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Kick off the rendering
        this.queueFrame();
    }

    detatch() {
        this.canvas = null;
        this.ctx = null;
        if (this._request !== false)
            window.cancelAnimationFrame(this._request);
    }

}