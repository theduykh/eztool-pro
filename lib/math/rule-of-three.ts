/**
 * Rule of Three (Tính Tam Suất) calculation logic
 */

export type RuleType = "direct" | "inverse";

/**
 * Calculates the unknown value (D) in a rule of three equation:
 * A -> B
 * C -> D
 * 
 * Direct: D = (B * C) / A
 * Inverse: D = (A * B) / C
 */
export function calculateRuleOfThree(a: number, b: number, c: number, type: RuleType): number {
    if (a === 0) throw new Error("Giá trị A không thể bằng 0.");
    
    if (type === "direct") {
        return (b * c) / a;
    } else {
        if (c === 0) throw new Error("Giá trị C không thể bằng 0 đối với tỷ lệ nghịch.");
        return (a * b) / c;
    }
}
