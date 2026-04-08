export interface WheelItem {
    id: string;
    label: string;
}

export interface SpinResult {
    winner: WheelItem;
    winnerIndex: number;
}

/** Parse newline-separated text into wheel items, ignoring blank lines. */
export function parseItems(input: string): WheelItem[] {
    return input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((label, index) => ({ id: String(index), label }));
}

/** Pick a random winner from a non-empty list. Throws if list is empty. */
export function pickWinner(items: WheelItem[]): SpinResult {
    if (items.length === 0) {
        throw new Error("Không có mục nào để chọn");
    }
    const winnerIndex = Math.floor(Math.random() * items.length);
    return { winner: items[winnerIndex], winnerIndex };
}

/**
 * Given the current wheel rotation angle (radians) and item count,
 * determine which segment index is under the top pointer (at -PI/2).
 */
export function getWinnerIndexFromAngle(angle: number, itemCount: number): number {
    if (itemCount === 0) return 0;
    const segAngle = (2 * Math.PI) / itemCount;
    // Pointer is at canvas top = angle -PI/2 in standard canvas coordinates
    const pointerOffset = ((-Math.PI / 2 - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(pointerOffset / segAngle) % itemCount;
}
