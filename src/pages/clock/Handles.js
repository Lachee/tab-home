
/** State Machine for the mouse */
export class Mouse {

    /** @type {HTMLElement} */
    element;

    x = 0;
    y = 0;

    /** @type {Handle} currently grabbed handle */
    grabbed;

    grabOrigin;
    grabPosition;
    get grabDelta() { 
        return [ this.grabPosition[0] - this.grabOrigin[0], this.grabPosition[1] - this.grabOrigin[1] ];
    }

    /** @type {Handle[]} list of handles that can be grabbed */
    handles = [];

    constructor(element) {
        this.element = element;

        this.element.addEventListener('mousemove', (ev) => {
            this.x = ev.offsetX;
            this.y = ev.offsetY;

            if (this.grabbed) {
                this.element.style.cursor = 'grabbing';
                this.grabPosition = this.position;
                this.grabbed.onDrag(this.grabDelta);
            } else {                
                let withinAnyHandle = false;
                for(let handle of this.handles) {
                    if (this.within(...handle.rect)) {
                        withinAnyHandle = true;
                        break;
                    }
                }

                this.element.style.cursor = withinAnyHandle ? 'grab' : 'unset';
            }
        });

        this.element.addEventListener('mousedown', (ev) => {
            this.x = ev.offsetX;
            this.y = ev.offsetY;

            if (!this.grabbed) {
                for(let handle of this.handles) {
                    if (this.within(...handle.rect) && this.grab(handle))
                        break;
                }  
            }
        });

        this.element.addEventListener('mouseup', (ev) => {
            this.x = ev.offsetX;
            this.y = ev.offsetY;
            this.drop();
        })
    }

    get position() {
        return [ this.x, this.y ];
    }

    grab(handle) {
        if (this.grabbed) return false;
        this.grabbed = handle;
        this.grabOrigin = this.position;
        this.grabbed.onGrab();
        return true;
    }

    drop() {
        if (!this.grabbed) return false;
        this.grabPosition = this.position;
        this.grabbed.onDrop();
        this.grabbed = null;
        return true;
    }

    /**
     * Registers a handle to the list of grabbables
     * @param {Handle} handle 
     */
    registerHandle(handle) {
        this.handles.push(handle);
    }

    /**
     * Unregisters a handle from the list of grabbables
     * @param {Handle} handle 
     */
    unregisterHandle(handle) {
        this.handles = this.handles.filter((e) => e !== handle && e !== null);
    }

    /** Checks if the mouse is within the box */
    within(x, y, width, height) {
        if (Array.isArray(x)) return this.within(...x);
        return this.x > x && this.x < (width + x) 
                && this.y > y && this.y < (height + y);
    }
}

/**
 * Handle that users can grab onto
 */
class Handle {

    /** @type {Mouse} mouse tracker */
    mouse;

    constructor(mouse) {
        this.mouse = mouse || new Mouse(window);
        this.mouse.registerHandle(this);
    }

    onGrab() {}
    onDrop() {}
    onDrag(delta) {}

    /** Rectangle used for grabbing */
    get rect() {
        return [ 0, 0, 0, 0 ];
    }
    
    /** @return {boolean} Is this handle currently grabbed? */
    get grabbed() {
        return this.mouse.grabbed === this;
    }

    /** @return {boolean} Is the handle currently hovered */
    get hovered() {
        return this.mouse.grabbed == null && this.mouse.within(...this.rect);
    }
}

/** Basic slide handle */
export class SlideHandle extends Handle {

    /** @type {HTMLCanvasElement} */
    canvas;
    x = 0;
    y = 0;

    width = 10;
    length = 150;

    _originValue;
    value = 0.5;

    constructor(canvas, mouse = null) {
        super(mouse || new Mouse(canvas || window));
        this.canvas = canvas;
    }

    set position(position) {
        this.x = position.x || position[0];
        this.y = position.y || position[1];
    }

    get position() {
        return [ this.x, this.y ];
    }

    get rect() {
        const hWidth = this.width / 2;
        const x = this.x + (this.value * this.length) - hWidth;
        const y = this.y - hWidth;
        return [ x, y, this.width, this.width ];
    }

    onGrab() {
        this._originValue = this.value;
    }

    onDrag(delta) {
        this.value = this._originValue + (delta[0] / this.length);
        this.value = this.value < 0 ? 0 : (this.value > 1 ? 1 : this.value);
    }
        
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx = null) {
        if (ctx == null)
            ctx = this.canvas.getContext('2d');

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y);
        ctx.stroke();
        ctx.closePath();

        this._drawHandle(ctx);
    }

    
    /**
     * Draws the current handle
     * @param {CanvasRenderingContext2D} ctx 
     */
    _drawHandle(ctx) {

        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0A0A0A';

        if (this.grabbed)
            ctx.fillStyle = '#555555';
        else if (this.hovered)
            ctx.fillStyle = 'white';
        else 
            ctx.fillStyle = '#AAAAAA';

        ctx.beginPath();
        ctx.rect(...this.rect);
        ctx.stroke();
        ctx.fill();
    }
}