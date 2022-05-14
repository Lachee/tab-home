import React, { useRef } from "react";
import { easeInBack, easeOutElastic } from "../../utils/Smoothing";
import { AngleHandle, Handler, SlideHandle } from "./Handles";

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

export const TimePiecePalettes = {
    Pastel: ["#eae4e9","#fff1e6","#fde2e4","#fad2e1","#e2ece9","#bee1e6","#f0efeb","#dfe7fd","#cddafd"]
}

class Segment {

    /** @type {Date} */
    startTime;
    /** @type {Date} */
    endTime;
    /** @type {string} */
    color;

    constructor(startHours, endHours) {
        this.startTime = new Date();
        this.startTime.setHours(startHours);
        this.endTime = new Date();
        this.endTime.setHours(endHours);
    }

    getStartRadians() {
        const hours = this.startTime.getHours();
        return  (-Math.PI / 2) + (Math.PI*2)*(hours / 12.0);
    }

    getEndRadians() {
        const hours = this.endTime.getHours();
        return  (-Math.PI / 2) + (Math.PI*2)*(hours / 12.0);
    }

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

    faceColor = '#cddafd';
    numeralColor = 'black';
    segmentColors = TimePiecePalettes.Pastel;

    /** @type {Segment[]} list of segments */
    segments = [];

    /** @type {Handler} */
    handles;

    constructor(canvas = null) {
        if (canvas)
            this.attach(canvas);

        const segment = new Segment(10, 14);
        this.addSegment(segment);

    }

    addSegment(segment) {
        if (!segment.color)
            segment.color = this.segmentColors[(this.segments.length) % this.segmentColors.length];
        this.segments.push(segment);
    }

    attach(canvas) {
        if (canvas === null) 
            throw Error('Canvas is null. Did you mean detatch()?');
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.frame = 0;

        const { width, height } = canvas;
        const x = width / 2.0;
        const y = height / 2.0;


        this.handles = new Handler(this.canvas, window);

        this.slideHandle = new SlideHandle();
        this.slideHandle.position = [ 10, 10 ];
        this.slideHandle.length = 150;
        this.handles.registerHandle(this.slideHandle);

        const segment = new Segment(10, 14);
        this.angleHandle = new AngleHandle([x, y], segment.startRadians, segment.endRadians);
        this.handles.registerHandle(this.angleHandle);

        // Kick off the rendering
        this.queueFrame();
    }

    detatch() {
        this.canvas = null;
        this.ctx = null;
        if (this._request !== false)
            window.cancelAnimationFrame(this._request);
    }

    /** Renders a frame */
    drawFrame() {
        if (this.canvas == null)
            return; 

        // Queue the next frame
        this.frame++;
        this.queueFrame();

        // Start rendering
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        
        const fRadius =  Math.max(width, height) / 2.0;
        const radius = fRadius * 0.75;
        const x = width / 2.0;
        const y = height / 2.0;

        const ogFont = ctx.font;

        //================== Draw segment backings
        for (let segment of this.segments) 
        {
            const start = segment.getStartRadians();
            const end = segment.getEndRadians();    
            ctx.fillStyle = segment.color;
            fillCone(ctx, x, y, fRadius, start, end);
        }

        //================== Draw the clock face
        ctx.beginPath();
        ctx.fillStyle = this.faceColor;
        ctx.arc(x, y, radius, 0, 360);
        ctx.fill();
        ctx.closePath();
        
        //================== Draw the clock numbers
        ctx.fillStyle = this.numeralColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '18pt Arial';
        circlePoints(x, y, radius * 0.9, 12, (x, y, index) => {
            const numeral = (index + 2) % 12 + 1;
            ctx.fillText(numeral, x, y);
        });

        //================== Draw current hand
        const date = new Date();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 10;
        drawHand(ctx, x, y, radius * 0.8, date.getMinutes() / 60);
        drawHand(ctx, x, y, radius * 0.5, date.getHours() / 12);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        
        if (this.secondMode === TimePieceSecondMode.Smooth) {
            drawHand(ctx, x, y, radius, ((date.getSeconds() * 1000) + date.getMilliseconds()) / 60000);
        } else if (this.secondMode === TimePieceSecondMode.Jittery) {
            const now = date.getSeconds() / 60;
            const next = (date.getSeconds() + 1) / 60;
            const progress  = date.getMilliseconds() / 1000;
            const jitter    = easeInBack(progress) * (next - now);
            drawHand(ctx, x, y, radius, now + jitter);
        } else {
            drawHand(ctx, x, y, radius, date.getSeconds() / 60);
        }

        // Center Cap
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 360);
        ctx.fill();
        ctx.closePath();

        // Debug
        ctx.fillStyle = 'black';
        ctx.font = ogFont;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText("Frame: " + this.frame, 0, height);
        ctx.fillText("Now: " + (new Date()).toLocaleString(), 0, height - 10);
        
        // Handle
        ctx.fillText("Mouse: " + this.handles.mousePosition.toString(), 0, height - 20);
        ctx.fillText("Value: :" + this.slideHandle.value, 0, height - 30);

        // Draw all handles
        this.handles.draw(ctx);
    }

    /** Queues the frame for rendering  */
    queueFrame() {
        if (this.canvas == null) 
            return false;
        return this._request = window.requestAnimationFrame(() => {
            try {
                this.drawFrame();
            }catch(e) {
                console.error('Aborted Render:', e);
                this.detatch();
            }
        });
    }

}

/** @param {CanvasRenderingContext2D} ctx */
function drawHand(ctx, x, y, length, progress, rounded = true) {
    const [x2, y2] = circlePoint(x, y, length, (2 * Math.PI * progress) - Math.PI / 2);
    if (rounded) {
        ctx.beginPath();
        ctx.arc(x2, y2, ctx.lineWidth/2, 0, 360);
        ctx.fill();
        ctx.closePath();
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function fillCone(ctx, x, y, radius, startRadians, endRadians) {
    const [xa, ya] = circlePoint(x, y, radius, startRadians);
    const [xb, yb] = circlePoint(x, y, radius, endRadians);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(xa, ya);
    ctx.lineTo(xb, yb);
    ctx.lineTo(x, y);
    ctx.arc(x, y, radius, startRadians, endRadians);
    ctx.fill();
    ctx.closePath();
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
