import { CircleHandle, CompliantHandle, Handle, mixinOnDrag, RectHandle } from './Handles';
import { clamp, pointOnCircle, angle } from '../../utils/Math';

/** Basic slide handle */
export class SlideControl extends CompliantHandle {

    x = 0;
    y = 0;

    handleWidth = 10;
    length = 150;

    _originValue;
    value = 0.5;

    set position(position) {
        this.x = position.x || position[0];
        this.y = position.y || position[1];
    }
    get position() {
        return [ this.x, this.y ];
    }

    /** If we want to be a rect */
    get handleRect() {
        const hWidth = this.handleWidth / 2;
        const x = this.x + (this.value * this.length) - hWidth;
        const y = this.y - hWidth;
        return [ x, y, this.handleWidth, this.handleWidth ];
    }
    get handleCircle() {
        return [ this.x + (this.value * this.length), this.y, this.handleWidth  ];
    }


    onGrab() {
        this._originValue = this.value;
    }

    onDrag(delta) {
        this.value = clamp(this._originValue + (delta[0] / this.length));
    }
        
    /**
     * Draws the control
     * @param {CanvasRenderingContext2D} ctx 
    */
    draw(ctx) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y);
        ctx.stroke();
        ctx.closePath();

        this.drawHandle(ctx);
    }
}

export class ArcControl extends CompliantHandle {
    x = 0;
    y = 0; 
    radius = 50;

    value = 0.5;

    minAngle = 0;
    maxAngle = Math.PI;

    handleWidth = 10;

    rotateHandle = true;
    trackStyle = 'gray';

    constructor(position, radius, minAngle, maxAngle) {
        super();
        this.position = position;
        this.radius = radius;
        this.minAngle = minAngle;
        this.maxAngle = maxAngle;

        if (this.minAngle == undefined)
            throw new Error('minAngle is undefined');
        if (this.maxAngle == undefined) 
            throw new Error('maxAngle is undefined');
    }

    get position() {
        return [ this.x, this.y ];
    }
    set position(position) {
        this.x = position.x || position[0];
        this.y = position.y || position[1];
    }
  
    get angle() {
        return this.minAngle + ((this.maxAngle  - this.minAngle) * clamp(this.value));
    }
    set angle(theta) {
        const diff = this.maxAngle - this.minAngle;
        const relative = theta - this.minAngle;
        this.value = clamp(relative / diff);
    }

    get handleRect() {
        const hWidth = this.handleWidth / 2;
        const [x, y] = pointOnCircle(this.x, this.y, this.radius, this.angle);
        return [ x - hWidth, y - hWidth, this.handleWidth, this.handleWidth];
    }
    get handleCircle() {
        const [x, y] = pointOnCircle(this.x, this.y, this.radius, this.angle);
        return [ x, y, this.handleWidth  ];
    }

    onDrag(delta) {
        const aMouse = angle( ...this.position, ...this.handler.mousePosition);
        this.angle = clamp(aMouse, this.minAngle, this.maxAngle);
    }

    /**
     * Draws the control
     * @param {CanvasRenderingContext2D} ctx 
    */
    draw(ctx) {

        if (this.trackStyle  && this.trackStyle !== 'blank') {
            ctx.strokeStyle = this.trackStyle;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, this.minAngle, this.maxAngle);
            ctx.stroke();
            ctx.closePath();
        }
        
        // Debug to verify angles
        /*
        const aMouse = angle( ...this.position, ...this.handler.mousePosition);
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.75, 0, aMouse);
        ctx.stroke();
        ctx.closePath();
        ctx.fillText(`${aMouse.toFixed(2)}R, ${(aMouse * Radians2Degrees).toFixed(2)}°`, ...this.handler.mousePosition);
        */
        if (this.rotateHandle) {
            const [ handleX, handleY, handleWidth, handleHeight ] = this.handleRect;
            ctx.translate(handleX + (handleWidth / 2), handleY + (handleHeight / 2));
            ctx.rotate(this.angle);
            ctx.translate(-(handleX + (handleWidth / 2)), -(handleY + (handleHeight / 2)));
        }

        this.drawHandle(ctx);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

export class WedgeControl extends Handle {
    x = 0;
    y = 0; 
    radius = 50;

    minAngle = 0;
    maxAngle = 2*Math.PI;

    #arcA;
    #arcB;

    coneStroke = 'gray';

    constructor(position, radius, minAngle, maxAngle) {
        super();
        this.radius = radius;
        this.minAngle = minAngle;
        this.maxAngle = maxAngle;

        this.#arcA = new ArcControl(this.position, this.radius, this.minAngle, this.maxAngle);
        this.#arcA.angle = this.minAngle;
        this.#arcA.trackStyle = false;
        mixinOnDrag(this.#arcA, (delta) => {
            // TODO: Determine if we exceed our cap and if so then we should drop and grab the end instead
            // But we can only exceed based of the delta
        });
        
        this.#arcB = new ArcControl(this.position, this.radius, this.minAngle, this.maxAngle);
        this.#arcB.angle = this.maxAngle;
        this.#arcB.trackStyle = false;

        this.position = position;
    }

    
    get position() {
        return [ this.x, this.y ];
    }
    set position(position) {
        this.x = position.x || position[0];
        this.y = position.y || position[1];
        this.#arcA.position = position;
        this.#arcB.position = position;
    }
  
    get startAngle() { return this.#arcA.angle}
    set startAngle(angle) {
        this.#arcA.angle = angle;
    }

    get endAngle() { return this.#arcB.angle; }
    set endAngle(angle) {
        this.#arcB.angle = angle;
    }

    onRegister(handler) {       
        handler.registerHandle(this.#arcA);
        handler.registerHandle(this.#arcB);
    }

    onUnregister(handler) {
        handler.unregisterHandle(this.#arcA);
        handler.unregisterHandle(this.#arcB);
    }

    /**
     * Draws the handle for the specific control
     * @param {CanvasRenderingContext2D} ctx 
     */
     drawHandle(ctx) { 
        if (this.coneStroke) {
            ctx.strokeStyle = this.coneStroke;
            ctx.beginPath();
            ctx.moveTo(...this.position);
            ctx.lineTo(...this.#arcA.handleCircle);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(...this.position);
            ctx.lineTo(...this.#arcB.handleCircle);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.strokeStyle = 'magenta';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
        ctx.moveTo(...this.position);
        ctx.lineTo(...this.#arcA.handleCircle);
        ctx.stroke();
        ctx.closePath();
     }
}