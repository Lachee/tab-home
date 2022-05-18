
/**
 * Source https://easings.net/#easeOutElastic
 * @param {number} x 
 * @returns {number}
 */
export function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
        ? 0
        : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;

}

/**
 * source https://easings.net/#easeInBack
 * @param {number} x 
 * @returns {number}
 */
export function easeInBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * x * x * x - c1 * x * x;
}