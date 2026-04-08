// lib/image/qr-generator.ts
// Pure TypeScript logic — no React, no browser APIs.

// ─── Content types ─────────────────────────────────────────────────────────────

export type ContentType = "url" | "text" | "wifi" | "email" | "sms";

export interface WifiContent {
    ssid: string;
    password: string;
    encryption: "WPA" | "WEP" | "nopass";
    hidden: boolean;
}

export interface EmailContent {
    to: string;
    subject: string;
    body: string;
}

export interface SmsContent {
    phone: string;
    message: string;
}

// ─── Data string builder ───────────────────────────────────────────────────────

/**
 * Build the QR-encoded data string from the given content type and field values.
 * Each format follows an established QR standard.
 */
export function buildQRData(
    type: ContentType,
    url: string,
    text: string,
    wifi: WifiContent,
    email: EmailContent,
    sms: SmsContent,
): string {
    switch (type) {
        case "url":
            return url.trim() || "https://eztool.pro";

        case "text":
            return text;

        case "wifi": {
            const enc =
                wifi.encryption === "nopass" ? "nopass" : wifi.encryption;
            const hiddenPart = wifi.hidden ? "H:true;" : "";
            return `WIFI:T:${enc};S:${escapeWifi(wifi.ssid)};P:${escapeWifi(wifi.password)};${hiddenPart};`;
        }

        case "email": {
            const params: string[] = [];
            if (email.subject.trim())
                params.push(`subject=${encodeURIComponent(email.subject)}`);
            if (email.body.trim())
                params.push(`body=${encodeURIComponent(email.body)}`);
            const query = params.length > 0 ? `?${params.join("&")}` : "";
            return `mailto:${email.to}${query}`;
        }

        case "sms":
            return `smsto:${sms.phone}:${sms.message}`;
    }
}

/** Escape special characters in WiFi SSID / password per RFC. */
function escapeWifi(s: string): string {
    return s.replace(/([\\;,":'])/g, "\\$1");
}

// ─── UI option arrays ──────────────────────────────────────────────────────────

export interface LabeledOption<T extends string> {
    label: string;
    value: T;
}

export type QRDotStyle =
    | "square"
    | "dots"
    | "rounded"
    | "extra-rounded"
    | "classy"
    | "classy-rounded";

export type QRCornerSquareStyle =
    | "square"
    | "dot"
    | "extra-rounded"
    | "rounded"
    | "dots"
    | "classy"
    | "classy-rounded";

export type QRCornerDotStyle =
    | "square"
    | "dot"
    | "rounded"
    | "dots"
    | "classy"
    | "classy-rounded"
    | "extra-rounded";

export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type QRDownloadFormat = "png" | "svg" | "jpeg" | "webp";
export type QRShape = "square" | "circle";

export const DOT_STYLES: LabeledOption<QRDotStyle>[] = [
    { label: "Vuông", value: "square" },
    { label: "Chấm", value: "dots" },
    { label: "Bo nhẹ", value: "rounded" },
    { label: "Bo nhiều", value: "extra-rounded" },
    { label: "Classy", value: "classy" },
    { label: "Classy bo", value: "classy-rounded" },
];

export const CORNER_SQUARE_STYLES: LabeledOption<QRCornerSquareStyle>[] = [
    { label: "Vuông", value: "square" },
    { label: "Chấm", value: "dot" },
    { label: "Bo góc", value: "extra-rounded" },
];

export const CORNER_DOT_STYLES: LabeledOption<QRCornerDotStyle>[] = [
    { label: "Vuông", value: "square" },
    { label: "Chấm", value: "dot" },
];

export const ERROR_CORRECTION_LEVELS: LabeledOption<QRErrorCorrectionLevel>[] =
    [
        { label: "L – 7%", value: "L" },
        { label: "M – 15%", value: "M" },
        { label: "Q – 25%", value: "Q" },
        { label: "H – 30%", value: "H" },
    ];

export interface DownloadFormatOption {
    label: string;
    value: QRDownloadFormat;
    hint: string;
}

export const DOWNLOAD_FORMATS: DownloadFormatOption[] = [
    { label: "PNG", value: "png", hint: "Nền trong suốt" },
    { label: "SVG", value: "svg", hint: "Vô hạn tỉ lệ" },
    { label: "JPEG", value: "jpeg", hint: "File nhỏ hơn" },
    { label: "WebP", value: "webp", hint: "Hiện đại" },
];

export interface DownloadSizeOption {
    label: string;
    value: number;
}

export const DOWNLOAD_SIZES: DownloadSizeOption[] = [
    { label: "256 px", value: 256 },
    { label: "512 px", value: 512 },
    { label: "1024 px", value: 1024 },
    { label: "2048 px", value: 2048 },
];

export const CONTENT_TABS: LabeledOption<ContentType>[] = [
    { label: "URL", value: "url" },
    { label: "Văn bản", value: "text" },
    { label: "WiFi", value: "wifi" },
    { label: "Email", value: "email" },
    { label: "SMS", value: "sms" },
];
