import { describe, it, expect } from "vitest";
import {
    normalizeForSearch,
    searchTools,
    type SearchableTool,
} from "./tool-search";

const TOOLS: SearchableTool[] = [
    {
        id: "json-formatter",
        path: "/dev/json-formatter",
        category: "dev",
        isHot: true,
        name: "JSON Formatter",
        description: "Beautify, validate, and minify JSON data.",
        categoryLabel: "Dev Tools",
    },
    {
        id: "qr-generator",
        path: "/image/qr-generator",
        category: "image",
        isHot: true,
        name: "Tạo mã QR Code",
        description: "Tạo mã QR cho link, văn bản, wifi.",
        categoryLabel: "Hình Ảnh",
    },
    {
        id: "color-converter",
        path: "/image/color-converter",
        category: "image",
        name: "Chuyển đổi HEX / RGB",
        description: "Chuyển đổi mã màu giữa HEX, RGB, HSL.",
        categoryLabel: "Hình Ảnh",
    },
    {
        id: "unit-converter",
        path: "/math/unit-converter",
        category: "math",
        name: "Đổi Đơn Vị đo lường",
        description: "Chuyển đổi chiều dài, khối lượng, nhiệt độ.",
        categoryLabel: "Toán Học",
    },
];

const ids = (q: string) => searchTools(q, TOOLS).map((r) => r.tool.id);

describe("normalizeForSearch", () => {
    it("lowercases and strips Vietnamese diacritics", () => {
        expect(normalizeForSearch("Tạo mã QR Code")).toBe("tao ma qr code");
    });

    it("maps đ/Đ to d", () => {
        expect(normalizeForSearch("Đổi Đơn Vị")).toBe("doi don vi");
    });

    it("collapses whitespace", () => {
        expect(normalizeForSearch("  hello   world  ")).toBe("hello world");
    });
});

describe("searchTools", () => {
    it("returns nothing for an empty query", () => {
        expect(searchTools("", TOOLS)).toEqual([]);
        expect(searchTools("   ", TOOLS)).toEqual([]);
    });

    it("matches accent-insensitively (query without diacritics finds accented names)", () => {
        expect(ids("ma qr")).toContain("qr-generator");
        expect(ids("doi don vi")).toContain("unit-converter");
    });

    it("matches by description", () => {
        expect(ids("wifi")).toEqual(["qr-generator"]);
    });

    it("matches by category label", () => {
        expect(ids("toan")).toEqual(["unit-converter"]);
    });

    it("requires every token to match (AND semantics)", () => {
        // "qr" matches qr-generator but "xyz" matches nothing → excluded
        expect(ids("qr xyz")).toEqual([]);
    });

    it("ranks a name prefix match above a description-only match", () => {
        // "chuyen" prefixes color-converter & unit-converter descriptions,
        // and is the name prefix of color-converter ("Chuyển đổi ...").
        const result = ids("chuyen doi");
        expect(result[0]).toBe("color-converter");
    });

    it("ranks an exact name match first", () => {
        expect(ids("json formatter")[0]).toBe("json-formatter");
    });

    it("excludes tools where no field matches", () => {
        expect(ids("kubernetes")).toEqual([]);
    });
});
