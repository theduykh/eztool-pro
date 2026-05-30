/**
 * HTML Formatter — Pure logic functions.
 * Pretty-print / indent một chuỗi HTML mà không phụ thuộc React hay browser API.
 */

export interface HtmlResult {
    success: true;
    data: string;
}

export interface HtmlError {
    success: false;
    error: string;
}

export type HtmlFormatResult = HtmlResult | HtmlError;

// ─── Self-contained export styling ─────────────────────────────────────────────
// HTML do TipTap sinh ra dựa vào CSS của editor để hiển thị đúng. Khi đem HTML đó
// mở ở môi trường khác (không có CSS đó) thì task-list mất checkbox, bảng mất viền…
// Các hàm dưới đây "nhúng" style inline để HTML xuất ra tự chứa, render đúng ở mọi nơi.

const TASK_LIST_STYLE = "list-style:none;margin:0;padding:0;";
const TASK_ITEM_STYLE = "display:flex;align-items:flex-start;gap:0.5rem;margin:0.25rem 0;";
const TASK_CHECKBOX_STYLE = "width:16px;height:16px;margin:0.2rem 0 0;flex:0 0 auto;";

const TABLE_STYLE = "border-collapse:collapse;width:100%;";
const TABLE_HEADER_STYLE = "border:1px solid #d4d4d8;padding:6px 10px;background:#f4f4f5;text-align:left;font-weight:600;";
const TABLE_CELL_STYLE = "border:1px solid #d4d4d8;padding:6px 10px;";

/** Bổ sung style vào opening tag (gộp với style sẵn có). Idempotent. */
function mergeStyle(tag: string, attrs: string, style: string): string {
    const styleMatch = attrs.match(/\sstyle\s*=\s*"([^"]*)"/);
    if (styleMatch) {
        if (styleMatch[1].includes(style)) return `<${tag}${attrs}>`;
        const existing = styleMatch[1].replace(/;?\s*$/, ";");
        return `<${tag}${attrs.replace(styleMatch[0], ` style="${existing}${style}"`)}>`;
    }
    return `<${tag}${attrs} style="${style}">`;
}

/** Chỉ thêm style khi tag chưa có thuộc tính style (tôn trọng style do người dùng nhập). */
function addStyleIfAbsent(tag: string, attrs: string, style: string): string {
    if (/\sstyle\s*=/.test(attrs)) return `<${tag}${attrs}>`;
    return `<${tag}${attrs} style="${style}">`;
}

/**
 * Làm cho HTML task-list (TipTap) tự chứa style inline: bỏ dấu chấm danh sách,
 * đặt checkbox cùng hàng với nội dung, hiển thị checkbox rõ ràng và phản ánh
 * trạng thái đã tick (data-checked="true" → input checked).
 *
 * Idempotent — chạy nhiều lần không nhân đôi.
 */
export function inlineTaskListStyles(html: string): string {
    let out = html
        .replace(/<ul\b([^>]*\bdata-type="taskList"[^>]*)>/g, (_m, attrs: string) =>
            mergeStyle("ul", attrs, TASK_LIST_STYLE),
        )
        .replace(/<li\b([^>]*\bdata-type="taskItem"[^>]*)>/g, (_m, attrs: string) =>
            mergeStyle("li", attrs, TASK_ITEM_STYLE),
        );

    // Với mỗi taskItem: style + checked cho checkbox bên trong.
    out = out.replace(
        /(<li\b[^>]*\bdata-type="taskItem"[^>]*>)([\s\S]*?)(<input\b[^>]*?type="checkbox"[^>]*?>)/g,
        (_m, liTag: string, between: string, input: string) => {
            const checked = /data-checked="true"/.test(liTag);
            let inp = input;
            if (checked && !/\schecked\b/.test(inp)) inp = inp.replace(/<input\b/, "<input checked");
            if (!/\sstyle\s*=/.test(inp)) inp = inp.replace(/<input\b/, `<input style="${TASK_CHECKBOX_STYLE}"`);
            return `${liTag}${between}${inp}`;
        },
    );

    return out;
}

/**
 * Nhúng viền/căn lề inline cho bảng do editor sinh ra, để bảng hiển thị có lưới
 * khi mở HTML ở môi trường không có CSS. Bỏ qua thẻ đã có style (giữ bảng người dùng tự định dạng).
 *
 * Idempotent.
 */
export function inlineTableStyles(html: string): string {
    return html
        .replace(/<table\b([^>]*)>/g, (_m, attrs: string) => addStyleIfAbsent("table", attrs, TABLE_STYLE))
        .replace(/<th\b([^>]*)>/g, (_m, attrs: string) => addStyleIfAbsent("th", attrs, TABLE_HEADER_STYLE))
        .replace(/<td\b([^>]*)>/g, (_m, attrs: string) => addStyleIfAbsent("td", attrs, TABLE_CELL_STYLE));
}

/**
 * Biến HTML của editor thành HTML "tự chứa" — render đúng ở mọi trình duyệt
 * mà không cần CSS kèm theo (task-list + table). Idempotent.
 */
export function inlineExportStyles(html: string): string {
    return inlineTableStyles(inlineTaskListStyles(html));
}

/** Số space indent mặc định. */
const DEFAULT_INDENT = 2;

/** Các thẻ void (không có thẻ đóng). */
const VOID_ELEMENTS = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);

/** Các thẻ giữ nguyên nội dung bên trong (không format/đụng vào). */
const RAW_TEXT_ELEMENTS = new Set(["script", "style", "pre", "textarea"]);

type Token =
    | { kind: "open"; raw: string; name: string }
    | { kind: "close"; raw: string; name: string }
    | { kind: "self"; raw: string; name: string }
    | { kind: "void"; raw: string; name: string }
    | { kind: "comment"; raw: string }
    | { kind: "doctype"; raw: string }
    | { kind: "text"; raw: string }
    | { kind: "raw"; raw: string };

function getTagName(tagSource: string): string {
    // tagSource ví dụ: "<div class='x'>" hoặc "</div>" hoặc "<br/>"
    const match = tagSource.match(/^<\/?\s*([a-zA-Z][a-zA-Z0-9-]*)/);
    return match ? match[1].toLowerCase() : "";
}

/**
 * Tách chuỗi HTML thành danh sách token theo thứ tự xuất hiện.
 * Nội dung của script/style/pre/textarea được giữ nguyên (token "raw").
 */
function tokenize(html: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = html.length;

    while (i < len) {
        if (html[i] === "<") {
            // Comment
            if (html.startsWith("<!--", i)) {
                const end = html.indexOf("-->", i + 4);
                const stop = end === -1 ? len : end + 3;
                tokens.push({ kind: "comment", raw: html.slice(i, stop) });
                i = stop;
                continue;
            }
            // Doctype / declaration
            if (html[i + 1] === "!") {
                const end = html.indexOf(">", i);
                const stop = end === -1 ? len : end + 1;
                tokens.push({ kind: "doctype", raw: html.slice(i, stop) });
                i = stop;
                continue;
            }
            // Normal tag
            const end = html.indexOf(">", i);
            if (end === -1) {
                // Tag không đóng — coi như text
                tokens.push({ kind: "text", raw: html.slice(i) });
                break;
            }
            const tagSource = html.slice(i, end + 1);
            const name = getTagName(tagSource);
            const isClose = tagSource.startsWith("</");
            const isSelfClose = /\/\s*>$/.test(tagSource);
            i = end + 1;

            if (isClose) {
                tokens.push({ kind: "close", raw: tagSource, name });
                continue;
            }

            if (VOID_ELEMENTS.has(name)) {
                tokens.push({ kind: "void", raw: tagSource, name });
                continue;
            }

            if (isSelfClose) {
                tokens.push({ kind: "self", raw: tagSource, name });
                continue;
            }

            tokens.push({ kind: "open", raw: tagSource, name });

            // Giữ nguyên nội dung của raw-text element
            if (RAW_TEXT_ELEMENTS.has(name)) {
                const closeTag = `</${name}`;
                const closeIdx = html.toLowerCase().indexOf(closeTag, i);
                if (closeIdx === -1) {
                    tokens.push({ kind: "raw", raw: html.slice(i) });
                    i = len;
                } else {
                    const rawContent = html.slice(i, closeIdx);
                    if (rawContent.length > 0) tokens.push({ kind: "raw", raw: rawContent });
                    i = closeIdx;
                }
            }
            continue;
        }

        // Text cho đến thẻ tiếp theo
        const next = html.indexOf("<", i);
        const stop = next === -1 ? len : next;
        tokens.push({ kind: "text", raw: html.slice(i, stop) });
        i = stop;
    }

    return tokens;
}

/**
 * Format (pretty-print) chuỗi HTML với indentation.
 * @param raw    Chuỗi HTML gốc
 * @param indent Số space mỗi cấp (mặc định 2)
 */
export function formatHtml(raw: string, indent: number = DEFAULT_INDENT): HtmlFormatResult {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
        return { success: false, error: "Dữ liệu đầu vào trống." };
    }

    let tokens: Token[];
    try {
        tokens = tokenize(trimmed);
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : "Không thể phân tích HTML.",
        };
    }

    const pad = " ".repeat(Math.max(0, indent));
    const lines: string[] = [];
    let depth = 0;

    const push = (content: string) => {
        lines.push(pad.repeat(depth) + content);
    };

    for (const token of tokens) {
        switch (token.kind) {
            case "text": {
                const text = token.raw.replace(/\s+/g, " ").trim();
                if (text.length > 0) push(text);
                break;
            }
            case "raw": {
                // Giữ nguyên các dòng nội dung, thêm indent ở mức hiện tại
                const inner = token.raw.replace(/^\n+|\s+$/g, "");
                if (inner.length === 0) break;
                for (const line of inner.split("\n")) {
                    lines.push(pad.repeat(depth) + line.trimEnd());
                }
                break;
            }
            case "open":
                push(token.raw);
                depth++;
                break;
            case "close":
                depth = Math.max(0, depth - 1);
                push(token.raw);
                break;
            case "void":
            case "self":
            case "comment":
            case "doctype":
                push(token.raw);
                break;
        }
    }

    return { success: true, data: lines.join("\n") };
}

/**
 * Nén (minify) chuỗi HTML — bỏ khoảng trắng thừa giữa các thẻ.
 * Nội dung của script/style/pre/textarea được giữ nguyên.
 */
export function minifyHtml(raw: string): HtmlFormatResult {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
        return { success: false, error: "Dữ liệu đầu vào trống." };
    }

    let tokens: Token[];
    try {
        tokens = tokenize(trimmed);
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : "Không thể phân tích HTML.",
        };
    }

    let out = "";
    for (const token of tokens) {
        if (token.kind === "text") {
            out += token.raw.replace(/\s+/g, " ");
        } else if (token.kind === "raw") {
            out += token.raw;
        } else {
            out += token.raw;
        }
    }

    return { success: true, data: out.trim() };
}
