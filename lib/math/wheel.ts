// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WheelSlice {
    text: string;
    color: string;
    /** Start rotation of this slice in degrees */
    rotation: number;
}

// ─── Color palette ─────────────────────────────────────────────────────────────

/**
 * 14 vibrant / pastel colours that cycle, ensuring adjacent slices
 * always have high contrast regardless of item count.
 */
const SLICE_COLORS: string[] = [
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#22C55E", // Green
    "#EAB308", // Yellow
    "#F97316", // Orange
    "#A855F7", // Purple
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#6366F1", // Indigo
    "#06B6D4", // Cyan
    "#8B5CF6", // Violet
    "#F43F5E", // Rose
];

// ─── Pure functions ────────────────────────────────────────────────────────────

/**
 * Generate wheel slice data from a list of item labels.
 *
 * Each slice gets:
 * - `text`     – the label
 * - `color`    – a HEX colour (cycling through SLICE_COLORS)
 * - `rotation` – the starting angle in degrees (0° = 12 o'clock)
 *
 * @returns empty array when items is empty.
 */
export function generateWheelSlices(items: string[]): WheelSlice[] {
    if (items.length === 0) return [];

    const sliceAngle = 360 / items.length;

    return items.map((text, index) => ({
        text,
        color: SLICE_COLORS[index % SLICE_COLORS.length],
        rotation: index * sliceAngle,
    }));
}

/**
 * Fisher-Yates shuffle (immutable – returns a new array).
 */
export function shuffleItems(items: string[]): string[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Calculate the target rotation angle for a spin.
 *
 * - Adds 5-10 full rotations (random) so the wheel visually spins many times.
 * - Adds a random offset within 0°–360° to land on a random slice.
 * - `currentRotation` is accumulated so multiple spins don't "snap back".
 *
 * @returns the absolute final rotation in degrees.
 */
export function calculateSpinAngle(currentRotation: number): number {
    const fullRotations = (5 + Math.floor(Math.random() * 6)) * 360; // 5–10 full turns
    const randomOffset = Math.random() * 360;
    return currentRotation + fullRotations + randomOffset;
}

/**
 * Determine the winning slice index based on the final rotation angle.
 *
 * The pointer is at 3 o'clock (right side, 90°). Because CSS rotates the wheel
 * clockwise, we need to figure out which slice sits under the pointer.
 *
 * @param finalAngle  – the total accumulated CSS rotation in degrees
 * @param itemCount   – number of slices
 * @returns index of the winning slice (0-based), or -1 if no items.
 */
export function getWinnerIndex(finalAngle: number, itemCount: number): number {
    if (itemCount <= 0) return -1;

    const sliceAngle = 360 / itemCount;

    // Normalise angle into 0-360 range
    const normalised = ((finalAngle % 360) + 360) % 360;

    // The pointer is at the right (90°). When the wheel rotates clockwise by
    // `normalised` degrees, the slice at "90 - normalised" sits under the pointer.
    const pointerAngle = (90 - normalised + 360) % 360;

    return Math.floor(pointerAngle / sliceAngle) % itemCount;
}
