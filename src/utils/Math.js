export function pointsOnCircle(x, y, radius, n, callback) {
    for (let i = 0; i < n; i++) {
        const [ x2, y2 ] = pointOnCircle(x, y, radius, 2 * Math.PI * i / n);
        callback(x2, y2, i);
    }
}

export function pointOnCircle(x, y, radius, radians) {
    const x2 = x + radius * Math.cos(radians);
    const y2 = y + radius * Math.sin(radians);
    return [ x2, y2 ];
}

export function clamp(v, min = 0, max = 1) {    
    return v < min ? min : (v > max ? max : v);
}