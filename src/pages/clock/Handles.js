
export const InputMethod = {
    Mouse: 'mouse',
    Touch: 'touch',
}


/** State Machine for the mouse */
export class Handler {

    enableMouseControl = true;
    enableTouchControl = true;

    /** @type {HTMLElement} */
    element;

    container;

    /** Current mouse position */
    mousePosition = [0,0];
    inputMethod = InputMethod.Mouse;
    
    /** @type {Handle} currently grabbed handle */
    grabbed;
    grabOrigin      = [0,0];
    get grabDelta() { 
        return [ this.mousePosition[0] - this.grabOrigin[0], this.mousePosition[1] - this.grabOrigin[1] ];
    }

    /** @type {Handle[]} list of handles that can be grabbed */
    handles = [];

    /**
     * Creates a Handler that will track and manage interaction with handles
     * @param {HTMLElement} element The element the mouse events are relative too.
     * @param {HTMLElement|Window} container The container the mouse events are triggered from. Set to the window to have mouse update outside the phsyical bounds of the element.
     */
    constructor(element, container = null) {
        this.element = element;
        this.container = container || element;

        // Mouse Move ( Hover & Drag )
        const mouseMove = (ev) => {  
            this.inputMethod = ev.touches ? InputMethod.Touch : InputMethod.Mouse;
            this._internalSetMouseTouch(ev);

            if (this.grabbed) {     // If we are grabbing and element, process the drag
                this.element.style.cursor = 'grabbing';
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
        };
  
        // Mouse Down ( Grab )
        const mouseDown = (ev) => {
            this.inputMethod = ev.touches ? InputMethod.Touch : InputMethod.Mouse;
            this._internalSetMouseTouch(ev);
            if (!this.grabbed) {
                for(let handle of this.handles) {
                    if (handle.contains(this.mousePosition)) {
                        if (this.grab(handle)) {
                            break;
                        }
                    }
                }  
            }
        };
        // Mouse Up ( Drop )
        const mouseUp = (ev) => {  
            this.inputMethod = ev.touches ? InputMethod.Touch : InputMethod.Mouse;
            this._internalSetMouseTouch(ev);
            this.drop();
        };

        if (this.enableMouseControl) {
            this.container.addEventListener('mousemove', mouseMove);
            this.container.addEventListener('mousedown', mouseDown);
            this.container.addEventListener('mouseup', mouseUp);
        }

        if (this.enableTouchControl) {
            this.container.addEventListener('touchmove', (ev) => {
                mouseMove(ev);
                ev.preventDefault();
                //if (this.grabbed) 
            }, { passive: false });

            this.container.addEventListener('touchstart', mouseDown);
            this.container.addEventListener('touchend', mouseUp);
        }
    }

    _internalSetMouseTouch(touch) {
        // If we are an array of touches, just set the first one.
        if (touch.touches) {
            if (touch.touches.length > 0)
                this._internalSetMouseTouch(touch.touches[0]);
            return;
        }

        const rect = this.element.getBoundingClientRect();
        this.mousePosition = [ touch.clientX - rect.left, touch.clientY - rect.top ];
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
    get dragged() {
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
export class RectHandle extends Handle {    
    get handleRect() { return [ 0, 0, 10, 10 ]; }

    contains(x, y) {
        if (Array.isArray(x))
            return this.contains(...x);
        const [ x1, y1, width, height ] = this.handleRect;
        return x >= x1 && x <= (x1 + width) 
                &&  y >= y1 && y <= (y1 + height);
    }
    
    /**
     * Draws the control
     * @param {CanvasRenderingContext2D} ctx 
    */
    draw(ctx){
        this.drawHandle(ctx); 
    }

    /**
     * Draws the current handle
     * @param {CanvasRenderingContext2D} ctx 
    */
    drawHandle(ctx) {

        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0A0A0A';

        if (this.dragged)
            ctx.fillStyle = '#555555';
        else if (this.hovered)
            ctx.fillStyle = 'white';
        else 
            ctx.fillStyle = '#AAAAAA';

        ctx.beginPath();
        ctx.rect(...this.handleRect);
        ctx.stroke();
        ctx.fill();
    }
}

export class CircleHandle extends Handle {
    get handleCircle() { return [0,0, 10]; }

    contains(x, y) {
        if (Array.isArray(x))
            return this.contains(...x);
        
        const [ x2, y2, radius ] = this.handleCircle;
        const dist = Math.sqrt(Math.pow((x2 - x), 2) + Math.pow((y2 - y), 2));
        return dist <= radius;
    }
    
    /**
     * Draws the control
     * @param {CanvasRenderingContext2D} ctx 
    */
    draw(ctx){
        this.drawHandle(ctx); 
    }

    /**
     * Draws the current handle
     * @param {CanvasRenderingContext2D} ctx 
    */
    drawHandle(ctx) {

        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0A0A0A';

        if (this.dragged)
            ctx.fillStyle = '#555555';
        else if (this.hovered)
            ctx.fillStyle = 'white';
        else 
            ctx.fillStyle = '#AAAAAA';

        const [x, y, radius] = this.handleCircle;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }
}
export class CompliantHandle extends Handle {

    get handleRect() { return [ 0, 0, 10, 10 ]; }
    get handleCircle() { return [0,0, 10]; }

    #mode = InputMethod.Mouse;

    #rect;
    #circle;
    #current;

    /** Always draw the rectangle mode */
    alwaysDrawRect = true;

    constructor(mode = InputMethod.Touch) {
        super();
        this.#rect = new RectHandle();
        Object.defineProperty(this.#rect, 'handleRect', {
            get: () => this.handleRect
        });

        this.#circle = new CircleHandle();
        Object.defineProperty(this.#circle, 'handleCircle', {
            get: () => this.handleCircle
        });
        
        this.mode = mode;
    }

    get mode() { return this.#mode; }
    set mode(mode) {
        switch(mode) {
            default: throw new Error('Unkown compliance mode');
            case InputMethod.Mouse:
                this.#mode = InputMethod.Mouse;
                this.#current = this.#rect;
                break;

            case InputMethod.Touch:
                this.#mode = InputMethod.Touch;
                this.#current = this.#circle;
                break;
        }
    }

    onGrab() {
        this.#current.onGrab();
    }
    onDrop() {
        this.#current.onDrop();
    }
    onDrag(delta) {
        this.#current.onDrag(delta);
    }
    onHover() {        
        this.#current.onHover();
    }

    /**
     * Checks if the point is within this handle 
     * @returns {boolean} */
    contains(x, y) {
        return this.#current.contains(x, y);
    }

    /**
     * Draws the handle for the specific control
     * @param {CanvasRenderingContext2D} ctx 
     */
     drawHandle(ctx) { 
        if (this.handler.inputMethod != this.mode)
            this.mode = this.handler.inputMethod;

        if (this.alwaysDrawRect)
            this.#rect.drawHandle(ctx);
        else
            this.#current.drawHandle(ctx);
     }

}

function isTouchDevice() {
    return 'createTouch' in document;
  }