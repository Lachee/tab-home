import React, { useRef } from "react";
import { easeInBack, easeOutElastic } from "../../utils/Smoothing";

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

export const TimePieceSecondMode = {
    Instant: 'instant',
    Jittery: 'jitter',
    Smooth: 'smooth',
}
export class TimePiece {

    
    /** @type {HTMLCanvasElement} the current canvas */
    canvas;

    /** @type {CanvasRenderingContext2D} current context */
    ctx;

    /** current animation frame request id */
    _request = false;

    frame = 0;

    secondMode = TimePieceSecondMode.Jittery;

    faceColor = '#AEAEAE';
    numeralColor = '#000000';

    constructor(canvas = null) {
        if (canvas)
            this.attach(canvas);
    }

    /** Renders a frame */
    renderFrame() {
        if (this.canvas == null)
            return; 

        // Queue the next frame
        this.frame++;
        this.queueFrame();

        // Start rendering
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        
        const radius = Math.max(width, height) / 2.0 * 0.8;
        const x = width / 2.0;
        const y = height / 2.0;

        const ogFont = ctx.font;

        // Draw the clock face
        ctx.beginPath();
        ctx.fillStyle = this.faceColor;
        ctx.arc(x, y, radius, 0, 360);
        ctx.fill();
        ctx.closePath();
        
        // Draw the clock numbers
        ctx.fillStyle = this.numeralColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '18pt Arial';
        circlePoints(x, y, radius * 0.9, 12, (x, y, index) => {
            const numeral = (index + 2) % 12 + 1;
            ctx.fillText(numeral, x, y);
        });

        // Draw the clock hands
        /** @param {CanvasRenderingContext2D} ctx */
        function renderHand(ctx, x, y, length, progress) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            const [x2, y2] = circlePoint(x, y, length, (2 * Math.PI * progress) - Math.PI / 2);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.closePath();
        }

        // Draw current hand
        const date = new Date();        
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 10;
        renderHand(ctx, x, y, radius * 0.8, date.getMinutes() / 60);
        renderHand(ctx, x, y, radius * 0.5, date.getHours() / 12);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;

        if (this.secondMode === TimePieceSecondMode.Smooth) {
            renderHand(ctx, x, y, radius, ((date.getSeconds() * 1000) + date.getMilliseconds()) / 60000);
        } else if (this.secondMode === TimePieceSecondMode.Jittery) {
            const now = date.getSeconds() / 60;
            const next = (date.getSeconds() + 1) / 60;
            const progress  = date.getMilliseconds() / 1000;
            const jitter    = easeInBack(progress) * (next - now);
            renderHand(ctx, x, y, radius, now + jitter);
        } else {
            renderHand(ctx, x, y, radius, date.getSeconds() / 60);
        }

        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 360);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.font = ogFont;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText("Frame: " + this.frame, 0, height);
        ctx.fillText("Now: " + (new Date()).toLocaleString(), 0, height - 10);
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
        this.frame = 0;

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

function circlePoints(x, y, radius, n, callback) {
    for (let i = 0; i < n; i++) {
        const [ x2, y2 ] = circlePoint(x, y, radius, 2 * Math.PI * i / n);
        callback(x2, y2, i);
    }
}

function circlePoint(x, y, radius, radians) {
    const x2 = x + radius * Math.cos(radians);
    const y2 = y + radius * Math.sin(radians);
    return [ x2, y2 ];
}