"use client";

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    type ChangeEvent,
} from "react";
import {
    Download,
    Copy,
    Check,
    Upload,
    X,
    Link,
    FileText,
    Wifi,
    Mail,
    MessageSquare,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    buildQRData,
    CONTENT_TABS,
    DOT_STYLES,
    CORNER_SQUARE_STYLES,
    CORNER_DOT_STYLES,
    ERROR_CORRECTION_LEVELS,
    DOWNLOAD_FORMATS,
    DOWNLOAD_SIZES,
    type ContentType,
    type WifiContent,
    type EmailContent,
    type SmsContent,
    type QRDotStyle,
    type QRCornerSquareStyle,
    type QRCornerDotStyle,
    type QRErrorCorrectionLevel,
    type QRDownloadFormat,
    type QRShape,
} from "@/lib/image/qr-generator";
import type QRCodeStylingType from "qr-code-styling";
import type { Options as QRCodeStylingOptions } from "qr-code-styling";

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <ToolPanel padding="md">
            <ToolLabel className="mb-3 text-sm">{title}</ToolLabel>
            {children}
        </ToolPanel>
    );
}

// ─── Tab button strip ──────────────────────────────────────────────────────────

function TabStrip<T extends string>({
    options,
    value,
    onChange,
    idPrefix,
}: {
    options: { label: string; value: T }[];
    value: T;
    onChange: (v: T) => void;
    idPrefix?: string;
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    id={idPrefix ? `${idPrefix}-${opt.value}` : undefined}
                    onClick={() => onChange(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${value === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ─── Color picker ──────────────────────────────────────────────────────────────

function ColorInput({
    label,
    value,
    onChange,
    idPrefix,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    idPrefix?: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <label className="w-24 shrink-0 text-sm text-muted-foreground">
                {label}
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
                <input
                    id={idPrefix ? `${idPrefix}-picker` : undefined}
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                    id={idPrefix ? `${idPrefix}-text` : undefined}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
                    }}
                    className="w-20 bg-transparent font-mono text-sm text-foreground focus:outline-none"
                    maxLength={7}
                />
            </div>
        </div>
    );
}

// ─── Field input helpers ───────────────────────────────────────────────────────

const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const selectCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

// ─── Main component ────────────────────────────────────────────────────────────

export function QRGeneratorClient() {
    // ── Content state ──────────────────────────────────────────────────────
    const [contentType, setContentType] = useState<ContentType>("url");
    const [urlValue, setUrlValue] = useState("https://eztool.pro");
    const [textValue, setTextValue] = useState("");

    const [wifi, setWifi] = useState<WifiContent>({
        ssid: "",
        password: "",
        encryption: "WPA",
        hidden: false,
    });

    const [email, setEmail] = useState<EmailContent>({
        to: "",
        subject: "",
        body: "",
    });

    const [sms, setSms] = useState<SmsContent>({ phone: "", message: "" });

    // ── Style state ────────────────────────────────────────────────────────
    const [qrShape, setQrShape] = useState<QRShape>("square");
    const [dotStyle, setDotStyle] = useState<QRDotStyle>("square");
    const [dotColor, setDotColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [cornerSquareStyle, setCornerSquareStyle] =
        useState<QRCornerSquareStyle>("square");
    const [cornerDotStyle, setCornerDotStyle] =
        useState<QRCornerDotStyle>("square");
    const [errorCorrection, setErrorCorrection] =
        useState<QRErrorCorrectionLevel>("H");
    const [margin, setMargin] = useState(10);

    // ── Logo state ─────────────────────────────────────────────────────────
    const [logoDataURL, setLogoDataURL] = useState<string | null>(null);
    const [logoSize, setLogoSize] = useState(0.3);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // ── Download state ─────────────────────────────────────────────────────
    const [downloadFormat, setDownloadFormat] =
        useState<QRDownloadFormat>("png");
    const [downloadSize, setDownloadSize] = useState(512);

    // ── UI feedback state ──────────────────────────────────────────────────
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // ── QR instance refs ───────────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStylingType | null>(null);

    // ── Build the options object ───────────────────────────────────────────
    const buildOptions = useCallback(
        (overrides?: { width?: number; height?: number; type?: "canvas" | "svg" }) => {
            const data = buildQRData(
                contentType,
                urlValue,
                textValue,
                wifi,
                email,
                sms,
            );

            const options: QRCodeStylingOptions = {
                width: overrides?.width ?? 300,
                height: overrides?.height ?? 300,
                type: (overrides?.type ?? "canvas") as "canvas" | "svg",
                shape: qrShape,
                data,
                margin,
                qrOptions: {
                    errorCorrectionLevel: errorCorrection,
                },
                dotsOptions: {
                    type: dotStyle,
                    color: dotColor,
                },
                backgroundOptions: {
                    color: bgColor,
                },
                cornersSquareOptions: {
                    type: cornerSquareStyle,
                    color: dotColor,
                },
                cornersDotOptions: {
                    type: cornerDotStyle,
                    color: dotColor,
                },
            };

            if (logoDataURL) {
                options.image = logoDataURL;
                options.imageOptions = {
                    hideBackgroundDots: true,
                    imageSize: logoSize,
                    margin: 4,
                    crossOrigin: "anonymous",
                };
            } else {
                options.image = "";
            }

            return options;
        },
        [
            contentType,
            urlValue,
            textValue,
            wifi,
            email,
            sms,
            qrShape,
            dotColor,
            bgColor,
            dotStyle,
            cornerSquareStyle,
            cornerDotStyle,
            errorCorrection,
            margin,
            logoDataURL,
            logoSize,
        ],
    );

    // ── Initialize QR on mount ─────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function init() {
            const { default: QRCodeStyling } = await import("qr-code-styling");
            if (cancelled || !containerRef.current) return;
            qrCodeRef.current = new QRCodeStyling(buildOptions());
            qrCodeRef.current.append(containerRef.current);
        }

        init();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Update QR whenever settings change ─────────────────────────────────
    useEffect(() => {
        if (!qrCodeRef.current) return;
        qrCodeRef.current.update(buildOptions());
    }, [buildOptions]);

    // ── Logo upload ────────────────────────────────────────────────────────
    const handleLogoUpload = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                setLogoDataURL(ev.target?.result as string);
                // Force H-level error correction so QR remains scannable with logo
                setErrorCorrection("H");
            };
            reader.readAsDataURL(file);
        },
        [],
    );

    const removeLogo = useCallback(() => {
        setLogoDataURL(null);
        if (logoInputRef.current) logoInputRef.current.value = "";
    }, []);

    // ── Download ───────────────────────────────────────────────────────────
    const handleDownload = useCallback(async () => {
        setIsDownloading(true);
        try {
            const { default: QRCodeStyling } = await import("qr-code-styling");
            const isSvg = downloadFormat === "svg";
            const size = isSvg ? 1024 : downloadSize;

            const tempQR = new QRCodeStyling(
                buildOptions({
                    width: size,
                    height: size,
                    type: isSvg ? "svg" : "canvas",
                }),
            );
            await tempQR.download({
                name: "qrcode-eztool",
                extension: downloadFormat,
            });
        } finally {
            setIsDownloading(false);
        }
    }, [buildOptions, downloadFormat, downloadSize]);

    // ── Copy to clipboard ──────────────────────────────────────────────────
    const handleCopy = useCallback(async () => {
        if (!qrCodeRef.current) return;
        try {
            const rawData = await qrCodeRef.current.getRawData("png");
            if (!rawData || !(rawData instanceof Blob)) return;
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": rawData }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard API unavailable (non-HTTPS / permission denied)
        }
    }, []);

    // ── Reset all ──────────────────────────────────────────────────────────
    const handleReset = useCallback(() => {
        setContentType("url");
        setUrlValue("https://eztool.pro");
        setTextValue("");
        setWifi({ ssid: "", password: "", encryption: "WPA", hidden: false });
        setEmail({ to: "", subject: "", body: "" });
        setSms({ phone: "", message: "" });
        setQrShape("square");
        setDotStyle("square");
        setDotColor("#000000");
        setBgColor("#ffffff");
        setCornerSquareStyle("square");
        setCornerDotStyle("square");
        setErrorCorrection("H");
        setMargin(10);
        setLogoDataURL(null);
        setLogoSize(0.3);
        setDownloadFormat("png");
        setDownloadSize(512);
        if (logoInputRef.current) logoInputRef.current.value = "";
    }, []);

    // ─────────────────────────────────────────────────────────────────────────

    const CONTENT_ICONS: Record<ContentType, React.ReactNode> = {
        url: <Link className="size-3.5" />,
        text: <FileText className="size-3.5" />,
        wifi: <Wifi className="size-3.5" />,
        email: <Mail className="size-3.5" />,
        sms: <MessageSquare className="size-3.5" />,
    };

    const downloadSection = (
        <Section title="Tải xuống">
            {/* Format */}
            <div className="mb-3">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Định dạng
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {DOWNLOAD_FORMATS.map((f) => (
                        <button
                            key={f.value}
                            id={`download-format-${f.value}`}
                            onClick={() => setDownloadFormat(f.value)}
                            title={f.hint}
                            className={`flex flex-col items-center rounded-lg py-2 text-xs font-semibold transition-colors ${downloadFormat === f.value
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                }`}
                        >
                            <span>{f.label}</span>
                            <span className="mt-0.5 text-[10px] opacity-70">
                                {f.hint}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Size (disabled for SVG) */}
            <div className="mb-4">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Kích thước
                    {downloadFormat === "svg" && (
                        <span className="ml-1 text-primary">
                            (SVG không giới hạn kích thước)
                        </span>
                    )}
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {DOWNLOAD_SIZES.map((s) => (
                        <button
                            key={s.value}
                            id={`download-size-${s.value}`}
                            onClick={() => setDownloadSize(s.value)}
                            disabled={downloadFormat === "svg"}
                            className={`rounded-lg py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${downloadSize === s.value &&
                                downloadFormat !== "svg"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Download button */}
            <Button
                id="btn-download"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full gap-2"
            >
                <Download className="size-4" />
                {isDownloading
                    ? "Đang tạo..."
                    : `Tải về ${downloadFormat.toUpperCase()}${downloadFormat !== "svg" ? ` (${downloadSize}px)` : ""}`}
            </Button>
        </Section>
    );

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* ─── RIGHT: Preview panel (first in DOM for mobile) ───── */}
            <div className="flex flex-1 flex-col items-center gap-4 lg:order-last">
                <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Xem trước
                    </p>

                    {/* QR preview — qr-code-styling appends a <canvas> here */}
                    <div className="flex justify-center">
                        <div
                            ref={containerRef}
                            className="overflow-hidden rounded-xl"
                            style={{ lineHeight: 0 }}
                        />
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                        id="btn-copy"
                        variant="outline"
                        onClick={handleCopy}
                        className="gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="size-4 text-green-500" />
                                Đã sao chép!
                            </>
                        ) : (
                            <>
                                <Copy className="size-4" />
                                Sao chép ảnh
                            </>
                        )}
                    </Button>

                    <Button
                        id="btn-reset"
                        variant="outline"
                        onClick={handleReset}
                        className="gap-2"
                    >
                        <RefreshCw className="size-4" />
                        Đặt lại
                    </Button>
                </div>

                <p className="max-w-xs text-center text-xs text-muted-foreground">
                    Thay đổi cài đặt bên dưới để tạo QR code tùy chỉnh. Kiểm
                    tra bằng cách quét thử trước khi in.
                </p>
                {/* ── 4. Download (Desktop only) ────────────────────────── */}
                <div className="hidden w-full lg:block">
                    {downloadSection}
                </div>
            </div>

            {/* ─── LEFT: Settings panel ──────────────────────────────── */}
            <div className="flex w-full flex-col gap-4 lg:w-[400px] lg:flex-shrink-0">
                {/* ── 1. Content type ─────────────────────────────────── */}
                <Section title="Nội dung">
                    {/* Content type tabs */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                        {CONTENT_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                id={`content-type-${tab.value}`}
                                onClick={() => setContentType(tab.value)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${contentType === tab.value
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    }`}
                            >
                                {CONTENT_ICONS[tab.value]}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic fields */}
                    {contentType === "url" && (
                        <input
                            id="input-url"
                            type="url"
                            className={inputCls}
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="https://example.com"
                        />
                    )}

                    {contentType === "text" && (
                        <textarea
                            id="input-text"
                            className={`${inputCls} h-28 resize-none font-mono`}
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            placeholder="Nhập văn bản tùy ý..."
                        />
                    )}

                    {contentType === "wifi" && (
                        <div className="flex flex-col gap-2">
                            <input
                                id="input-wifi-ssid"
                                className={inputCls}
                                value={wifi.ssid}
                                onChange={(e) =>
                                    setWifi((w) => ({
                                        ...w,
                                        ssid: e.target.value,
                                    }))
                                }
                                placeholder="Tên mạng WiFi (SSID)"
                            />
                            <input
                                id="input-wifi-password"
                                type="password"
                                className={inputCls}
                                value={wifi.password}
                                onChange={(e) =>
                                    setWifi((w) => ({
                                        ...w,
                                        password: e.target.value,
                                    }))
                                }
                                placeholder="Mật khẩu"
                            />
                            <select
                                id="select-wifi-encryption"
                                className={selectCls}
                                value={wifi.encryption}
                                onChange={(e) =>
                                    setWifi((w) => ({
                                        ...w,
                                        encryption: e.target.value as
                                            | "WPA"
                                            | "WEP"
                                            | "nopass",
                                    }))
                                }
                            >
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">Không mật khẩu</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                <input
                                    id="checkbox-wifi-hidden"
                                    type="checkbox"
                                    checked={wifi.hidden}
                                    onChange={(e) =>
                                        setWifi((w) => ({
                                            ...w,
                                            hidden: e.target.checked,
                                        }))
                                    }
                                    className="rounded"
                                />
                                Mạng ẩn (Hidden SSID)
                            </label>
                        </div>
                    )}

                    {contentType === "email" && (
                        <div className="flex flex-col gap-2">
                            <input
                                id="input-email-to"
                                type="email"
                                className={inputCls}
                                value={email.to}
                                onChange={(e) =>
                                    setEmail((m) => ({
                                        ...m,
                                        to: e.target.value,
                                    }))
                                }
                                placeholder="Địa chỉ email"
                            />
                            <input
                                id="input-email-subject"
                                className={inputCls}
                                value={email.subject}
                                onChange={(e) =>
                                    setEmail((m) => ({
                                        ...m,
                                        subject: e.target.value,
                                    }))
                                }
                                placeholder="Tiêu đề (không bắt buộc)"
                            />
                            <textarea
                                id="input-email-body"
                                className={`${inputCls} h-20 resize-none`}
                                value={email.body}
                                onChange={(e) =>
                                    setEmail((m) => ({
                                        ...m,
                                        body: e.target.value,
                                    }))
                                }
                                placeholder="Nội dung (không bắt buộc)"
                            />
                        </div>
                    )}

                    {contentType === "sms" && (
                        <div className="flex flex-col gap-2">
                            <input
                                id="input-sms-phone"
                                type="tel"
                                className={inputCls}
                                value={sms.phone}
                                onChange={(e) =>
                                    setSms((s) => ({
                                        ...s,
                                        phone: e.target.value,
                                    }))
                                }
                                placeholder="Số điện thoại (VD: +84912345678)"
                            />
                            <textarea
                                id="input-sms-message"
                                className={`${inputCls} h-20 resize-none`}
                                value={sms.message}
                                onChange={(e) =>
                                    setSms((s) => ({
                                        ...s,
                                        message: e.target.value,
                                    }))
                                }
                                placeholder="Tin nhắn"
                            />
                        </div>
                    )}
                </Section>

                {/* ── 4. Download (Mobile only) ─────────────────────────── */}
                <div className="block w-full lg:hidden">
                    {downloadSection}
                </div>

                {/* ── 2. Style & Color ─────────────────────────────────── */}
                <Section title="Thiết kế">
                    {/* QR shape */}
                    <div className="mb-4">
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Hình dạng QR
                        </p>
                        <TabStrip
                            idPrefix="qr-shape"
                            options={[
                                { label: "Vuông", value: "square" as QRShape },
                                { label: "Tròn", value: "circle" as QRShape },
                            ]}
                            value={qrShape}
                            onChange={setQrShape}
                        />
                    </div>

                    {/* Colors */}
                    <div className="mb-4 flex flex-col gap-2">
                        <ColorInput
                            idPrefix="input-dot-color"
                            label="Màu chấm"
                            value={dotColor}
                            onChange={setDotColor}
                        />
                        <ColorInput
                            idPrefix="input-bg-color"
                            label="Màu nền"
                            value={bgColor}
                            onChange={setBgColor}
                        />
                    </div>

                    {/* Dot style */}
                    <div className="mb-4">
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Kiểu chấm
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {DOT_STYLES.map((s) => (
                                <button
                                    key={s.value}
                                    id={`dot-style-${s.value}`}
                                    onClick={() => setDotStyle(s.value)}
                                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${dotStyle === s.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Corner square style */}
                    <div className="mb-4">
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Kiểu khung góc
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {CORNER_SQUARE_STYLES.map((s) => (
                                <button
                                    key={s.value}
                                    id={`corner-square-${s.value}`}
                                    onClick={() =>
                                        setCornerSquareStyle(s.value)
                                    }
                                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${cornerSquareStyle === s.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Corner dot style */}
                    <div className="mb-4">
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Kiểu mắt góc
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {CORNER_DOT_STYLES.map((s) => (
                                <button
                                    key={s.value}
                                    id={`corner-dot-${s.value}`}
                                    onClick={() => setCornerDotStyle(s.value)}
                                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${cornerDotStyle === s.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error correction */}
                    <div className="mb-4">
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Mức sửa lỗi
                            {logoDataURL && (
                                <span className="ml-1 text-amber-500">
                                    (H bắt buộc khi có logo)
                                </span>
                            )}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {ERROR_CORRECTION_LEVELS.map((s) => (
                                <button
                                    key={s.value}
                                    id={`error-correction-${s.value}`}
                                    onClick={() => setErrorCorrection(s.value)}
                                    disabled={
                                        !!logoDataURL && s.value !== "H"
                                    }
                                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${errorCorrection === s.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Margin */}
                    <div>
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Lề xung quanh:{" "}
                            <span className="font-semibold text-foreground">
                                {margin}px
                            </span>
                        </p>
                        <input
                            id="input-margin"
                            type="range"
                            min={0}
                            max={40}
                            step={2}
                            value={margin}
                            onChange={(e) => setMargin(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>
                </Section>

                {/* ── 3. Logo ───────────────────────────────────────────── */}
                <Section title="Logo">
                    {!logoDataURL ? (
                        <label id="logo-upload-label" className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-6 transition-colors hover:border-primary hover:bg-primary/5">
                            <Upload className="size-6 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Nhấn để chọn ảnh logo
                            </span>
                            <span className="text-xs text-muted-foreground/60">
                                PNG, SVG, JPEG — khuyến nghị nền trong suốt
                            </span>
                            <input
                                id="input-logo-upload"
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoUpload}
                            />
                        </label>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                {/* Logo preview */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={logoDataURL}
                                    alt="Logo"
                                    className="h-14 w-14 rounded-lg border border-border object-contain p-1"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Logo đã chọn
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Mức sửa lỗi tự động đặt về H
                                    </p>
                                </div>
                                <button
                                    id="btn-remove-logo"
                                    onClick={removeLogo}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    title="Xóa logo"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            {/* Logo size slider */}
                            <div>
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                    Kích thước logo:{" "}
                                    <span className="font-semibold text-foreground">
                                        {Math.round(logoSize * 100)}%
                                    </span>
                                </p>
                                <input
                                    id="input-logo-size"
                                    type="range"
                                    min={0.15}
                                    max={0.5}
                                    step={0.01}
                                    value={logoSize}
                                    onChange={(e) =>
                                        setLogoSize(Number(e.target.value))
                                    }
                                    className="w-full accent-primary"
                                />
                            </div>
                        </div>
                    )}
                </Section>
            </div>

        </div>
    );
}
