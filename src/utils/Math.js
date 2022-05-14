/**
 * Returns the coordinate of a point along the given circle of radius at given coordinates (x,y) that is radians around.
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius 
 * @param {*} callback function that is executed for every point
 * @returns 
 */
export function pointsOnCircle(x, y, radius, n, callback) {
    for (let i = 0; i < n; i++) {
        const [ x2, y2 ] = pointOnCircle(x, y, radius, 2 * Math.PI * i / n);
        callback(x2, y2, i);
    }
}

/**
 * Returns the coordinate of a point along the given circle of radius at given coordinates (x,y) that is radians around.
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius 
 * @param {number} radians 
 * @returns array of the coordinates [x, y];
 */
export function pointOnCircle(x, y, radius, radians) {
    const x2 = x + radius * Math.cos(radians);
    const y2 = y + radius * Math.sin(radians);
    return [ x2, y2 ];
}

export function angle(x1, y1, x2, y2) {
    var dy = y2 - y1;
    var dx = x2 - x1;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    //theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

/**
 * Clamps two values
 * @param {number} v value
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export function clamp(v, min = 0, max = 1) {    
    return v < min ? min : (v > max ? max : v);
}
