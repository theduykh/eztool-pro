/**
 * Percentage calculation logic for various scenarios
 */

/**
 * 1. What is X% of Y?
 */
export function calculateValueFromPercent(percent: number, total: number): number {
    return (percent / 100) * total;
}

/**
 * 2. X is what percent of Y?
 */
export function calculatePercentOf(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * 3. Percentage increase/decrease from X to Y
 */
export function calculatePercentChange(start: number, end: number): number {
    if (start === 0) return 0;
    return ((end - start) / start) * 100;
}

/**
 * 4. Value after adding X%
 */
export function addPercent(value: number, percent: number): number {
    return value * (1 + percent / 100);
}

/**
 * 5. Value after subtracting X%
 */
export function subtractPercent(value: number, percent: number): number {
    return value * (1 - percent / 100);
}
