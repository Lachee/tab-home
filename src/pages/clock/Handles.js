
/** State Machine for the mouse */
export class Handler {

    /** @type {HTMLElement} */
    element;

    /** Current mouse position */
    mousePosition = [0,0];
    
    /** @type {Handle} currently grabbed handle */
    grabbed;
    grabOrigin      = [0,0];
    grabPosition    = [0,0];
    get grabDelta() { 
        return [ this.grabPosition[0] - this.grabOrigin[0], this.grabPosition[1] - this.grabOrigin[1] ];
    }

    /** @type {Handle[]} list of handles that can be grabbed */
    handles = [];

    constructor(element) {
        this.element = element;

        // Mouse Move ( Hover & Drag )
        this.element.addEventListener('mousemove', (ev) => {
            this.mousePosition = [ ev.offsetX, ev.offsetY ];

            if (this.grabbed) {     // If we are grabbing and element, process the drag
                this.element.style.cursor = 'grabbing';
                this.grabPosition = this.mousePosition;
                this.grabbed.onDrag(this.grabDelta);
            } else {                // Otherwise for the first element we are within, we will call the onHover
                let withinAnyHandle = false;
                for(let handle of this.handles) {
                    if (handle.contains(this.mousePosition)) {
                        handle.onHover();
                        withinAnyHandle = true;
                        break;
                    }
                }
                this.element.style.cursor = withinAnyHandle ? 'grab' : 'unset';
            }
        });

        // Mouse Down ( Grab )
        this.element.addEventListener('mousedown', (ev) => {
            this.mousePosition = [ ev.offsetX, ev.offsetY ];

            if (!this.grabbed) {
                for(let handle of this.handles) {
                    if (handle.contains(this.mousePosition)) {
                        if (this.grab(handle)) {
                            break;
                        }
                    }
                }  
            }
        });

        // Mouse Up ( Drop )
        this.element.addEventListener('mouseup', (ev) => {
            this.mousePosition = [ ev.offsetX, ev.offsetY ];
            this.drop();
        })
    }

    grab(handle) {
        if (this.grabbed) return false;
        this.grabbed = handle;
        this.grabOrigin = this.mousePosition;
        this.grabbed.onGrab();
        return true;
    }

    drop() {
        if (!this.grabbed) return false;
        this.grabPosition = this.mousePosition;
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
        handle.handler = this;
    }

    /**
     * Unregisters a handle from the list of grabbables
     * @param {Handle} handle 
     */
    unregisterHandle(handle) {
        this.handles = this.handles.filter((e) => e !== handle && e !== null);
        handle.handler = null;
    }
    
    /**
     * Draws all the handle controls
     * @param {CanvasRenderingContext2D} ctx 
    */
    draw(ctx) {
        for(let handle of this.handles) {
            handle.draw(ctx);
        }
    }
}

/**
 * Handle that users can grab onto
 */
class Handle {

    /** @type {Handler} mouse tracker */
    handler;

    onGrab() {}
    onDrop() {}
    onDrag(delta) {}
    onHover() {}

    /**
     * Checks if the point is within this handle 
     * @returns {boolean} */
    contains(x, y) {
        if (Array.isArray(x))
            return this.contains(...x);
        return false;
    }

    /** @return {boolean} Is this handle currently grabbed? */
    get grabbed() {
        return this.handler && this.handler.grabbed === this;
    }

    /** @return {boolean} Is the handle currently hovered */
    get hovered() {
        return this.handler && this.handler.grabbed == null && this.contains(this.handler.mousePosition);
    }
    
    /**
     * Draws the control
     * @param {CanvasRenderingContext2D} ctx 
    */
    draw(ctx) {
        this.drawHandle(ctx);
    }

    /**
     * Draws the handle for the specific control
     * @param {CanvasRenderingContext2D} ctx 
     */
     drawHandle(ctx) { }
}

/** Handles regular rectangle handles */
class RectHandle extends Handle {    
    get rect() { 
        return [ 0, 0, 1, 1 ]; 
    }

    contains(x, y) {
        if (Array.isArray(x))
            return this.contains(...x);
        const [ x1, y1, width, height ] = this.rect;
        return x >= x1 && x <= (x1 + width) 
                &&  y >= y1 && y <= (y1 + height);
    }
    

    /**
     * Draws the current handle
     * @param {CanvasRenderingContext2D} ctx 
    */
    drawHandle(ctx) {

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

/** Basic slide handle */
export class SlideHandle extends RectHandle {

    x = 0;
    y = 0;

    width = 10;
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