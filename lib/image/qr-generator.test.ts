import { describe, it, expect } from "vitest";
import {
    buildQRData,
    DOT_STYLES,
    CORNER_SQUARE_STYLES,
    CORNER_DOT_STYLES,
    ERROR_CORRECTION_LEVELS,
    DOWNLOAD_FORMATS,
    DOWNLOAD_SIZES,
    CONTENT_TABS,
    type WifiContent,
    type EmailContent,
    type SmsContent,
} from "./qr-generator";

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const emptyWifi: WifiContent = {
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
};

const emptyEmail: EmailContent = { to: "", subject: "", body: "" };
const emptySms: SmsContent = { phone: "", message: "" };

// ─── buildQRData ───────────────────────────────────────────────────────────────

describe("buildQRData – url", () => {
    it("returns the URL as-is", () => {
        expect(
            buildQRData(
                "url",
                "https://example.com",
                "",
                emptyWifi,
                emptyEmail,
                emptySms,
            ),
        ).toBe("https://example.com");
    });

    it("trims leading/trailing whitespace", () => {
        expect(
            buildQRData(
                "url",
                "  https://example.com  ",
                "",
                emptyWifi,
                emptyEmail,
                emptySms,
            ),
        ).toBe("https://example.com");
    });

    it("falls back to eztool.pro when URL is empty", () => {
        expect(
            buildQRData("url", "", "", emptyWifi, emptyEmail, emptySms),
        ).toBe("https://eztool.pro");
    });

    it("falls back to eztool.pro when URL is only whitespace", () => {
        expect(
            buildQRData("url", "   ", "", emptyWifi, emptyEmail, emptySms),
        ).toBe("https://eztool.pro");
    });
});

describe("buildQRData – text", () => {
    it("returns the text verbatim", () => {
        expect(
            buildQRData(
                "text",
                "",
                "Hello World",
                emptyWifi,
                emptyEmail,
                emptySms,
            ),
        ).toBe("Hello World");
    });

    it("preserves newlines", () => {
        const text = "line1\nline2";
        expect(
            buildQRData("text", "", text, emptyWifi, emptyEmail, emptySms),
        ).toBe(text);
    });
});

describe("buildQRData – Vietnamese & UTF-8", () => {
    it("encodes Vietnamese characters as UTF-8 bytes", () => {
        const input = "Xin chào"; // 'à' is 2 bytes in UTF-8
        const result = buildQRData(
            "text",
            "",
            input,
            emptyWifi,
            emptyEmail,
            emptySms,
        );

        // 'à' (U+00E0) in UTF-8 is 0xC3 0xA0
        // Total expected bytes: X(1) i(1) n(1) space(1) c(1) h(1) à(2) o(1) = 9
        expect(result).toHaveLength(9);
        expect(result).not.toBe(input);
        expect(result.charCodeAt(6)).toBe(0xc3);
        expect(result.charCodeAt(7)).toBe(0xa0);
    });

    it("normalizes to NFC", () => {
        // 'e' + combining acute accent (NFD)
        const nfd = "th" + String.fromCharCode(0x65, 0x0301) + "!";
        const result = buildQRData(
            "text",
            "",
            nfd,
            emptyWifi,
            emptyEmail,
            emptySms,
        );

        // Should normalize to 'ế' (NFC) which is 3 bytes in UTF-8 (actually 'é' is 2 bytes, 'ế' is more)
        // 'é' (e acute) is 0xC3 0xA9. Total 2+1+1+1 = 5 bytes? 
        // Wait, nfd is "thé!". "é" is 0x65 + 0x301 (2 chars). 
        // NFC of "é" is 0xE9 (1 char). UTF-8 of 0xE9 is 0xC3 0xA9.
        expect(result).toHaveLength(5); // t(1) h(1) é(2) !(1)
    });
});

describe("buildQRData – wifi", () => {
    it("generates a valid WIFI: string", () => {
        const wifi: WifiContent = {
            ssid: "MyNetwork",
            password: "secret123",
            encryption: "WPA",
            hidden: false,
        };
        const result = buildQRData("wifi", "", "", wifi, emptyEmail, emptySms);
        expect(result).toBe("WIFI:T:WPA;S:MyNetwork;P:secret123;;");
    });

    it("sets nopass for open networks", () => {
        const wifi: WifiContent = {
            ssid: "OpenNet",
            password: "",
            encryption: "nopass",
            hidden: false,
        };
        const result = buildQRData("wifi", "", "", wifi, emptyEmail, emptySms);
        expect(result).toContain("T:nopass");
    });

    it("appends H:true for hidden networks", () => {
        const wifi: WifiContent = {
            ssid: "Hidden",
            password: "pass",
            encryption: "WPA",
            hidden: true,
        };
        const result = buildQRData("wifi", "", "", wifi, emptyEmail, emptySms);
        expect(result).toContain("H:true;");
    });

    it("escapes semicolons in SSID and backslashes in password", () => {
        const wifi: WifiContent = {
            ssid: "My;Network",
            password: "p@ss\\word",
            encryption: "WPA",
            hidden: false,
        };
        const result = buildQRData("wifi", "", "", wifi, emptyEmail, emptySms);
        expect(result).toContain("S:My\\;Network");
        expect(result).toContain("P:p@ss\\\\word");
    });
});

describe("buildQRData – email", () => {
    it("generates a mailto: URI without params when only 'to' is set", () => {
        const email: EmailContent = {
            to: "user@example.com",
            subject: "",
            body: "",
        };
        const result = buildQRData(
            "email",
            "",
            "",
            emptyWifi,
            email,
            emptySms,
        );
        expect(result).toBe("mailto:user@example.com");
    });

    it("appends subject when provided", () => {
        const email: EmailContent = {
            to: "user@example.com",
            subject: "Hello",
            body: "",
        };
        const result = buildQRData(
            "email",
            "",
            "",
            emptyWifi,
            email,
            emptySms,
        );
        expect(result).toContain("subject=Hello");
    });

    it("encodes special characters in subject", () => {
        const email: EmailContent = {
            to: "a@b.com",
            subject: "Hi & Bye",
            body: "",
        };
        const result = buildQRData(
            "email",
            "",
            "",
            emptyWifi,
            email,
            emptySms,
        );
        expect(result).toContain("Hi%20%26%20Bye");
    });

    it("appends both subject and body when both provided", () => {
        const email: EmailContent = {
            to: "a@b.com",
            subject: "Subj",
            body: "Msg",
        };
        const result = buildQRData(
            "email",
            "",
            "",
            emptyWifi,
            email,
            emptySms,
        );
        expect(result).toContain("subject=Subj");
        expect(result).toContain("body=Msg");
    });
});

describe("buildQRData – sms", () => {
    it("generates a smsto: URI", () => {
        const sms: SmsContent = { phone: "+84912345678", message: "Hello!" };
        const result = buildQRData(
            "sms",
            "",
            "",
            emptyWifi,
            emptyEmail,
            sms,
        );
        expect(result).toBe("smsto:+84912345678:Hello!");
    });
});

// ─── Option arrays ─────────────────────────────────────────────────────────────

describe("option arrays", () => {
    it("DOT_STYLES has 6 entries all with label and value", () => {
        expect(DOT_STYLES).toHaveLength(6);
        DOT_STYLES.forEach((s) => {
            expect(s.label).toBeTruthy();
            expect(s.value).toBeTruthy();
        });
    });

    it("CORNER_SQUARE_STYLES has 3 entries", () => {
        expect(CORNER_SQUARE_STYLES).toHaveLength(3);
    });

    it("CORNER_DOT_STYLES has 2 entries", () => {
        expect(CORNER_DOT_STYLES).toHaveLength(2);
    });

    it("ERROR_CORRECTION_LEVELS has 4 entries", () => {
        expect(ERROR_CORRECTION_LEVELS).toHaveLength(4);
        expect(ERROR_CORRECTION_LEVELS.map((e) => e.value)).toEqual([
            "L",
            "M",
            "Q",
            "H",
        ]);
    });

    it("DOWNLOAD_FORMATS has 4 entries with expected values", () => {
        expect(DOWNLOAD_FORMATS.map((f) => f.value)).toEqual([
            "png",
            "svg",
            "jpeg",
            "webp",
        ]);
    });

    it("DOWNLOAD_SIZES has 4 preset sizes", () => {
        expect(DOWNLOAD_SIZES.map((s) => s.value)).toEqual([
            256, 512, 1024, 2048,
        ]);
    });

    it("CONTENT_TABS covers all 5 content types", () => {
        expect(CONTENT_TABS.map((t) => t.value)).toEqual([
            "url",
            "text",
            "wifi",
            "email",
            "sms",
        ]);
    });
});
