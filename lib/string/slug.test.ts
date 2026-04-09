import { describe, it, expect } from "vitest";
import { toSlug } from "./slug";

describe("URL Slug Logic", () => {
    it("should convert plain text to slug", () => {
        expect(toSlug("Hello World")).toBe("hello-world");
    });

    it("should remove Vietnamese diacritics", () => {
        expect(toSlug("Công cụ tạo URL cực nhanh")).toBe("cong-cu-tao-url-cuc-nhanh");
        expect(toSlug("Xin chào Việt Nam")).toBe("xin-chao-viet-nam");
        expect(toSlug("Học lập trình tại eztool.pro")).toBe("hoc-lap-trinh-tai-eztoolpro");
    });

    it("should handle specialized characters like 'đ'", () => {
        expect(toSlug("Điện thoại bàn")).toBe("dien-thoai-ban");
        expect(toSlug("đường đời")).toBe("duong-doi");
    });

    it("should handle special symbols and multiple spaces", () => {
        expect(toSlug("Text @ with $ symbol!!!")).toBe("text-with-symbol");
        expect(toSlug("   too   many    spaces   ")).toBe("too-many-spaces");
    });

    it("should return empty string for empty input", () => {
        expect(toSlug("")).toBe("");
    });
});
