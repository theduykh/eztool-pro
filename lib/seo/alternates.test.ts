import { describe, it, expect } from "vitest";
import { buildAlternates, localizedHref } from "./alternates";

describe("localizedHref", () => {
    it("prefixes a tool path with the locale", () => {
        expect(localizedHref("vi", "/dev/json-formatter")).toBe(
            "/vi/dev/json-formatter",
        );
    });

    it("maps the home path to just the locale segment (no trailing slash)", () => {
        expect(localizedHref("en", "/")).toBe("/en");
        expect(localizedHref("en", "")).toBe("/en");
    });

    it("strips a trailing slash from the path", () => {
        expect(localizedHref("ja", "/text/word-counter/")).toBe(
            "/ja/text/word-counter",
        );
    });

    it("adds a leading slash when missing", () => {
        expect(localizedHref("ko", "math/bmi-calculator")).toBe(
            "/ko/math/bmi-calculator",
        );
    });
});

describe("buildAlternates", () => {
    it("sets the canonical to the current locale's URL", () => {
        const alt = buildAlternates("vi", "/dev/json-formatter");
        expect(alt.canonical).toBe("/vi/dev/json-formatter");
    });

    it("includes one hreflang per supported locale", () => {
        const alt = buildAlternates("en", "/dev/json-formatter");
        expect(alt.languages).toMatchObject({
            en: "/en/dev/json-formatter",
            vi: "/vi/dev/json-formatter",
            zh: "/zh/dev/json-formatter",
            ko: "/ko/dev/json-formatter",
            ja: "/ja/dev/json-formatter",
        });
    });

    it("includes an x-default pointing at the default locale", () => {
        const alt = buildAlternates("zh", "/image/qr-generator");
        expect(alt.languages?.["x-default"]).toBe("/en/image/qr-generator");
    });

    it("handles the home page path", () => {
        const alt = buildAlternates("en", "/");
        expect(alt.canonical).toBe("/en");
        expect(alt.languages?.["x-default"]).toBe("/en");
        expect(alt.languages?.ja).toBe("/ja");
    });
});
