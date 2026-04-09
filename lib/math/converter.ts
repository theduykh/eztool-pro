/**
 * Unit conversion logic supporting multiple categories
 */

export type UnitCategory = "length" | "weight" | "area" | "volume" | "temperature";

export interface UnitInfo {
    id: string;
    label: string;
    ratio: number; // Ratio to base unit (m, kg, m2, l)
}

const UNITS: Record<UnitCategory, UnitInfo[]> = {
    length: [
        { id: "mm", label: "Millimeters (mm)", ratio: 0.001 },
        { id: "cm", label: "Centimeters (cm)", ratio: 0.01 },
        { id: "m", label: "Meters (m)", ratio: 1 },
        { id: "km", label: "Kilometers (km)", ratio: 1000 },
        { id: "inch", label: "Inches (in)", ratio: 0.0254 },
        { id: "foot", label: "Feet (ft)", ratio: 0.3048 },
        { id: "yard", label: "Yards (yd)", ratio: 0.9144 },
        { id: "mile", label: "Miles (mi)", ratio: 1609.344 },
    ],
    weight: [
        { id: "mg", label: "Milligrams (mg)", ratio: 0.000001 },
        { id: "g", label: "Grams (g)", ratio: 0.001 },
        { id: "kg", label: "Kilograms (kg)", ratio: 1 },
        { id: "ton", label: "Metric Tons (t)", ratio: 1000 },
        { id: "oz", label: "Ounces (oz)", ratio: 0.0283495 },
        { id: "lb", label: "Pounds (lb)", ratio: 0.453592 },
    ],
    area: [
        { id: "mm2", label: "Square mm (mm²)", ratio: 0.000001 },
        { id: "cm2", label: "Square cm (cm²)", ratio: 0.0001 },
        { id: "m2", label: "Square meters (m²)", ratio: 1 },
        { id: "km2", label: "Square km (km²)", ratio: 1000000 },
        { id: "ha", label: "Hectares (ha)", ratio: 10000 },
        { id: "acre", label: "Acres (ac)", ratio: 4046.86 },
    ],
    volume: [
        { id: "ml", label: "Milliliters (ml)", ratio: 0.001 },
        { id: "l", label: "Liters (l)", ratio: 1 },
        { id: "m3", label: "Cubic meters (m³)", ratio: 1000 },
        { id: "cup", label: "Cups", ratio: 0.236588 },
        { id: "pint", label: "Pints", ratio: 0.473176 },
        { id: "quart", label: "Quarts", ratio: 0.946353 },
        { id: "gal", label: "Gallons", ratio: 3.78541 },
    ],
    temperature: [
        { id: "c", label: "Celsius (°C)", ratio: 1 },
        { id: "f", label: "Fahrenheit (°F)", ratio: 1 },
        { id: "k", label: "Kelvin (K)", ratio: 1 },
    ]
};

/**
 * Converts value from one unit to another within a category.
 */
export function convertUnit(value: number, from: string, to: string, category: UnitCategory): number {
    if (category === "temperature") {
        return convertTemperature(value, from, to);
    }

    const units = UNITS[category];
    const fromUnit = units.find(u => u.id === from);
    const toUnit = units.find(u => u.id === to);

    if (!fromUnit || !toUnit) return value;

    // Convert to base, then to target
    const baseValue = value * fromUnit.ratio;
    return baseValue / toUnit.ratio;
}

function convertTemperature(value: number, from: string, to: string): number {
    if (from === to) return value;

    let celsius = value;
    if (from === "f") celsius = (value - 32) * 5 / 9;
    if (from === "k") celsius = value - 273.15;

    if (to === "c") return celsius;
    if (to === "f") return celsius * 9 / 5 + 32;
    if (to === "k") return celsius + 273.15;

    return value;
}

export function getUnitsForCategory(category: UnitCategory): UnitInfo[] {
    return UNITS[category];
}
