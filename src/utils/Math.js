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

/** Gets the signed radians between the two coordinates */
export function angleSigned(x1, y1, x2, y2) {
    var dy = y2 - y1;
    var dx = x2 - x1;
    return Math.atan2(dy, dx);
}

/** Gets the radians between two coordinates */
export function angle(x1, y1, x2, y2) {
    const signed = angleSigned(x1, y1, x2, y2);
    if (signed < 0) return signed + 2*Math.PI;
    return signed;
}

export const Radians2Degrees = 180 / Math.PI;
export const Degrees2Radians = 180 * Math.PI;

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
