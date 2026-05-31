"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Image } from "@tiptap/extension-image";
import { Typography } from "@tiptap/extension-typography";
import { TableKit } from "@tiptap/extension-table";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { formatHtml, inlineExportStyles } from "@/lib/formatters/html";
import { cn } from "@/lib/utils";
import {
    FileCode,
    Eye,
    GripVertical,
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Code2,
    Subscript as SubIcon,
    Superscript as SupIcon,
    List,
    ListOrdered,
    ListChecks,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Link2Off,
    Quote,
    Minus,
    Undo,
    Redo,
    RemoveFormatting,
    Sparkles,
    Copy,
    Check,
    Trash2,
    Baseline,
    Highlighter,
    Image as ImageIcon,
    Table as TableIcon,
    ArrowLeftToLine,
    ArrowRightToLine,
    ArrowUpToLine,
    ArrowDownToLine,
} from "lucide-react";



const FONT_FAMILIES = [
    { label: "Font mặc định", value: "" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Courier New", value: "'Courier New', monospace" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
];

const FONT_SIZES = ["", "12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px"];

/**
 * Tài liệu nền của iframe chứa editor. Editor được render BÊN TRONG iframe nên
 * hoàn toàn cô lập khỏi CSS của website (Tailwind/prose/theme) — những gì hiển thị
 * khớp với HTML thô mà người dùng nhận được khi mở standalone.
 *
 * Chỉ bơm đúng các style tương ứng với phần được inline-style khi export
 * (task-list, table) cộng vài tiện ích khi soạn thảo (ô bảng đang chọn, tay kéo cột).
 * Phần còn lại (heading, đoạn văn, blockquote, code…) giữ nguyên style mặc định
 * của trình duyệt — đúng như khi mở file HTML trần.
 */
const IFRAME_SRCDOC = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0}
  body{padding:12px;word-wrap:break-word;overflow-wrap:break-word}
  .ProseMirror{min-height:calc(100vh - 24px);outline:none}
  .ProseMirror:focus{outline:none}
  ul[data-type="taskList"]{list-style:none;margin:0;padding:0}
  ul[data-type="taskList"] li{display:flex;align-items:flex-start;gap:.5rem;margin:.25rem 0}
  ul[data-type="taskList"] li>label{margin:.2rem 0 0;user-select:none}
  ul[data-type="taskList"] input[type=checkbox]{width:16px;height:16px;margin:0;flex:0 0 auto}
  ul[data-type="taskList"] li>div{flex:1 1 auto}
  ul[data-type="taskList"] li>div>p{margin:0}
  table{border-collapse:collapse;width:100%;table-layout:fixed;margin:1rem 0;overflow:hidden}
  td,th{border:1px solid #d4d4d8;padding:6px 10px;vertical-align:top;position:relative}
  th{background:#f4f4f5;font-weight:600;text-align:left}
  .selectedCell::after{content:"";position:absolute;inset:0;background:rgba(59,130,246,.15);pointer-events:none}
  .column-resize-handle{position:absolute;right:-2px;top:0;bottom:-2px;width:4px;background:#3b82f6;pointer-events:none}
  .ProseMirror.resize-cursor{cursor:col-resize}
  img{max-width:100%;height:auto}
  img.ProseMirror-selectednode{outline:2px solid #3b82f6}
</style></head><body></body></html>`;

// ─── Reusable toolbar atoms ────────────────────────────────────────────────────

interface ToolbarButtonProps {
    id: string;
    title: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}

function ToolbarButton({ id, title, onClick, active, disabled, children }: ToolbarButtonProps) {
    return (
        <button
            id={id}
            type="button"
            title={title}
            disabled={disabled}
            aria-pressed={active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-40",
                active
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="mx-1 h-5 w-px bg-border" />;
}

interface ColorControlProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    onPick: (color: string) => void;
    onClear: () => void;
}

function ColorControl({ id, title, icon, onPick, onClear }: ColorControlProps) {
    return (
        <div className="relative flex items-center">
            <label
                title={title}
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onMouseDown={(e) => e.preventDefault()}
            >
                {icon}
                <input
                    id={id}
                    type="color"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => onPick(e.target.value)}
                />
            </label>
            <button
                id={`${id}-clear`}
                type="button"
                title={`${title} — xóa`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onClear}
                className="-ml-1 text-[10px] text-muted-foreground/60 hover:text-foreground"
            >
                ✕
            </button>
        </div>
    );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function EditorToolbar({ editor, t, tc }: { editor: Editor; t: any; tc: any }) {
    const blockValue = (() => {
        for (let l = 1; l <= 6; l++) if (editor.isActive("heading", { level: l })) return `h${l}`;
        if (editor.isActive("codeBlock")) return "codeBlock";
        return "paragraph";
    })();

    const onBlockChange = (value: string) => {
        const chain = editor.chain().focus();
        if (value === "paragraph") chain.setParagraph().run();
        else if (value === "codeBlock") chain.toggleCodeBlock().run();
        else chain.setHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    };

    const setLink = () => {
        const previous = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt(t("enterLinkUrl"), previous ?? "https://");
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const insertImage = () => {
        const url = window.prompt(t("enterImageUrl"), "https://");
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const currentFont =
        (FONT_FAMILIES.find((f) => f.value && editor.isActive("textStyle", { fontFamily: f.value }))?.value) ?? "";
    const currentSize =
        FONT_SIZES.find((s) => s && editor.isActive("textStyle", { fontSize: s })) ?? "";

    const selectClass =
        "h-7 rounded-md border border-border bg-background px-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500";

    const inTable = editor.isActive("table");

    return (
        <div className="shrink-0 border-b border-border bg-muted/30">
            {/* Main row */}
            <div id="editor-toolbar" className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
                <ToolbarButton id="btn-undo" title={t("undoTitle")} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-redo" title={t("redoTitle")} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="size-3.5" />
                </ToolbarButton>

                <Divider />

                <select id="select-block" title={t("blockType")} value={blockValue} onChange={(e) => onBlockChange(e.target.value)} className={selectClass}>
                    <option value="paragraph">{t("paragraph")}</option>
                    <option value="h1">{t("h1")}</option>
                    <option value="h2">{t("h2")}</option>
                    <option value="h3">{t("h3")}</option>
                    <option value="h4">{t("h4")}</option>
                    <option value="h5">{t("h5")}</option>
                    <option value="h6">{t("h6")}</option>
                    <option value="codeBlock">{t("codeBlock")}</option>
                </select>
                <select id="select-font" title={t("fontFamily")} value={currentFont} onChange={(e) => { const v = e.target.value; const c = editor.chain().focus(); if (v) c.setFontFamily(v).run(); else c.unsetFontFamily().run(); }} className={cn(selectClass, "max-w-[7rem]")}>
                    {FONT_FAMILIES.map((f) => (
                        <option key={f.label} value={f.value}>{f.value === "" ? t("defaultFont") : f.label}</option>
                    ))}
                </select>
                <select id="select-size" title={t("fontSize")} value={currentSize} onChange={(e) => { const v = e.target.value; const c = editor.chain().focus(); if (v) c.setFontSize(v).run(); else c.unsetFontSize().run(); }} className={selectClass}>
                    {FONT_SIZES.map((s) => (
                        <option key={s || "default"} value={s}>{s || t("fontSize")}</option>
                    ))}
                </select>

                <Divider />

                <ToolbarButton id="btn-bold" title={t("boldTitle")} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-italic" title={t("italicTitle")} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-underline" title={t("underlineTitle")} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <UnderlineIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-strike" title={t("strikeTitle")} active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <Strikethrough className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-code" title={t("inlineCodeTitle")} active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
                    <Code className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-sub" title={t("subscriptTitle")} active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
                    <SubIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-sup" title={t("superscriptTitle")} active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
                    <SupIcon className="size-3.5" />
                </ToolbarButton>

                <Divider />

                <ColorControl id="input-text-color" title={t("textColor")} icon={<Baseline className="size-3.5" />} onPick={(c) => editor.chain().focus().setColor(c).run()} onClear={() => editor.chain().focus().unsetColor().run()} />
                <ColorControl id="input-highlight" title={t("textBgColor")} icon={<Highlighter className="size-3.5" />} onPick={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()} onClear={() => editor.chain().focus().unsetHighlight().run()} />

                <Divider />

                <ToolbarButton id="btn-ul" title={t("bulletListTitle")} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-ol" title={t("orderedListTitle")} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-task" title={t("taskListTitle")} active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
                    <ListChecks className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-quote" title={t("quoteTitle")} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-codeblock" title={t("codeBlockTitle")} active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                    <Code2 className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-hr" title={t("horizontalRuleTitle")} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus className="size-3.5" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton id="btn-align-left" title={t("alignLeftTitle")} active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                    <AlignLeft className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-align-center" title={t("alignCenterTitle")} active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                    <AlignCenter className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-align-right" title={t("alignRightTitle")} active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                    <AlignRight className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-align-justify" title={t("alignJustifyTitle")} active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
                    <AlignJustify className="size-3.5" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton id="btn-link" title={t("insertLink")} active={editor.isActive("link")} onClick={setLink}>
                    <LinkIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-unlink" title={t("removeLink")} disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
                    <Link2Off className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-image" title={t("insertImage")} onClick={insertImage}>
                    <ImageIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton id="btn-table" title={t("insertTable")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                    <TableIcon className="size-3.5" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton id="btn-clear-format" title={t("clearFormatting")} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
                    <RemoveFormatting className="size-3.5" />
                </ToolbarButton>
            </div>

            {/* Contextual table row */}
            {inTable && (
                <div id="table-toolbar" className="flex flex-wrap items-center gap-0.5 border-t border-border bg-blue-500/5 px-2 py-1.5">
                    <ToolLabel className="mr-1">{t("tableLabel")}</ToolLabel>
                    <ToolbarButton id="btn-col-before" title={t("addColumnBefore")} onClick={() => editor.chain().focus().addColumnBefore().run()}>
                        <ArrowLeftToLine className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton id="btn-col-after" title={t("addColumnAfter")} onClick={() => editor.chain().focus().addColumnAfter().run()}>
                        <ArrowRightToLine className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton id="btn-col-del" title={t("deleteColumn")} onClick={() => editor.chain().focus().deleteColumn().run()}>
                        <Trash2 className="size-3.5" />
                    </ToolbarButton>
                    <Divider />
                    <ToolbarButton id="btn-row-before" title={t("addRowBefore")} onClick={() => editor.chain().focus().addRowBefore().run()}>
                        <ArrowUpToLine className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton id="btn-row-after" title={t("addRowAfter")} onClick={() => editor.chain().focus().addRowAfter().run()}>
                        <ArrowDownToLine className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton id="btn-row-del" title={t("deleteRow")} onClick={() => editor.chain().focus().deleteRow().run()}>
                        <Trash2 className="size-3.5" />
                    </ToolbarButton>
                    <Divider />
                    <button id="btn-toggle-header" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeaderRow().run()} className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                        {t("toggleHeaderRow")}
                    </button>
                    <button id="btn-merge-cells" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().mergeOrSplit().run()} className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                        {t("mergeOrSplitCells")}
                    </button>
                    <button id="btn-table-del" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteTable().run()} className="rounded-md px-2 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10">
                        {t("deleteTable")}
                    </button>
                </div>
            )}
        </div>
    );
}

const EDITOR_EXTENSIONS = [
    StarterKit.configure({ link: { openOnClick: false } }),
    TextStyleKit,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({ nested: true }),
    Image.configure({ inline: false }),
    Typography,
    TableKit.configure({ table: { resizable: true } }),
];

/**
 * Khởi tạo TipTap và mount thẳng vào `mountEl` (node nằm TRONG iframe).
 * Chỉ được render khi `mountEl` đã sẵn sàng nên `useEditor` chạy đúng một lần với
 * element hợp lệ — document gốc của ProseMirror là document của iframe ⇒ cô lập CSS.
 * Component này không render DOM, chỉ quản lý vòng đời editor.
 */
function FrameEditor({
    mountEl,
    onReady,
    onChange,
    initialContent,
}: {
    mountEl: HTMLElement;
    onReady: (editor: Editor) => void;
    onChange: (html: string) => void;
    initialContent: string;
}) {
    useEditor({
        immediatelyRender: false,
        element: mountEl,
        extensions: EDITOR_EXTENSIONS,
        content: initialContent,
        editorProps: {
            attributes: {
                id: "output-html-editor",
                class: "max-w-none break-words focus:outline-none",
            },
        },
        onCreate: ({ editor }) => {
            onReady(editor);
            onChange(inlineExportStyles(editor.getHTML()));
        },
        onUpdate: ({ editor }) => onChange(inlineExportStyles(editor.getHTML())),
    });
    return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function HtmlViewerClient() {
    const t = useTranslations("toolUI.html-viewer");
    const tc = useTranslations("toolCommon");
    const initialContent = t.raw("initialHtml") as string;

    const [html, setHtml] = useState<string>(() => inlineExportStyles(initialContent));
    const [copied, setCopied] = useState(false);
    const [editor, setEditor] = useState<Editor | null>(null);
    // Node bên trong iframe để mount ProseMirror vào — có sau khi iframe load xong.
    const [mountEl, setMountEl] = useState<HTMLElement | null>(null);

    // Ref callback (chạy ngay lúc commit) thay cho onLoad để tránh race khi reload/mở
    // trực tiếp từ URL: lúc đó iframe có thể đã load XONG trước khi React kịp gắn onLoad.
    // Xử lý cả hai trường hợp: đã sẵn sàng (gọi setup ngay) và chưa (đợi sự kiện load).
    const attachFrame = useCallback((iframe: HTMLIFrameElement | null) => {
        if (!iframe) return;
        const setup = () => {
            const doc = iframe.contentDocument;
            // Bỏ qua document about:blank ban đầu — chỉ tiếp tục khi srcDoc đã nạp (có <style>).
            if (!doc?.body || !doc.head?.querySelector("style")) return;
            let el = doc.getElementById("tiptap-root");
            if (!el) {
                el = doc.createElement("div");
                el.id = "tiptap-root";
                doc.body.appendChild(el);
            }
            setMountEl(el);
        };
        setup();
        iframe.addEventListener("load", setup);
        return () => iframe.removeEventListener("load", setup);
    }, []);

    const handleRawChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const val = e.target.value;
            setHtml(val);
            editor?.commands.setContent(val, { emitUpdate: false });
        },
        [editor],
    );

    const handlePrettify = useCallback(() => {
        const result = formatHtml(html);
        if (result.success) {
            const styled = inlineExportStyles(result.data);
            setHtml(styled);
            editor?.commands.setContent(styled, { emitUpdate: false });
        }
    }, [html, editor]);

    const handleClear = useCallback(() => {
        setHtml("");
        editor?.commands.clearContent();
    }, [editor]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(html);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = html;
            ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [html]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ResizablePanelGroup orientation="horizontal" className="min-h-[200px] flex-1 md:min-h-[400px]">
                {/* ── Raw HTML input ── */}
                <ResizablePanel defaultSize={50} minSize={20}>
                    <ToolPanel
                        padding="none"
                        className="h-full"
                        bodyClassName="h-full"
                        header={
                            <>
                                <ToolLabel icon={<FileCode className="size-3.5" />}>{t("htmlRaw")}</ToolLabel>
                                <div className="flex items-center gap-3">
                                    <button id="btn-prettify" onClick={handlePrettify} className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground" title={t("formatTitle")}>
                                        <Sparkles className="mr-1 size-3.5" />
                                        {t("format")}
                                    </button>
                                    <button id="btn-copy" onClick={handleCopy} className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground">
                                        {copied ? (
                                            <>
                                                <Check className="mr-1 size-3.5 text-green-500" />
                                                {tc("copied")}
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-1 size-3.5" />
                                                {tc("copy")}
                                            </>
                                        )}
                                    </button>
                                    <button id="btn-clear" onClick={handleClear} className="flex items-center text-xs text-muted-foreground transition-colors hover:text-destructive" title={t("clearTitle")}>
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </>
                        }
                    >
                        <textarea
                            id="input-html"
                            value={html}
                            onChange={handleRawChange}
                            className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                            placeholder={t.raw("placeholderInput") as string}
                            spellCheck={false}
                        />
                    </ToolPanel>
                </ResizablePanel>

                <ResizableHandle className="w-4 cursor-col-resize bg-transparent transition-colors duration-150 hover:bg-accent/50 active:bg-accent/70 data-[resize-handle-active]:bg-accent/70">
                    <div className="z-10 flex h-8 w-4 items-center justify-center rounded-sm border bg-border shadow-sm">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                    </div>
                </ResizableHandle>

                {/* ── WYSIWYG editor (TipTap) ── */}
                <ResizablePanel defaultSize={50} minSize={20}>
                    <ToolPanel
                        padding="none"
                        className="h-full"
                        bodyClassName="flex h-full flex-col"
                        header={<ToolLabel icon={<Eye className="size-3.5" />}>{t("editorLabel")}</ToolLabel>}
                    >
                        {/* Wrapper LUÔN hiện diện: giữ iframe ở vị trí cố định để React không
                            remount nó khi toolbar xuất hiện (remount sẽ reset document iframe → mất editor). */}
                        <div className="contents">{editor ? <EditorToolbar editor={editor} t={t} tc={tc} /> : null}</div>
                        {/* Editor sống trong iframe ⇒ cô lập khỏi CSS website, hiển thị giống HTML thô */}
                        <iframe
                            ref={attachFrame}
                            id="editor-frame"
                            title={t("editorTitle")}
                            srcDoc={IFRAME_SRCDOC}
                            className="min-h-0 w-full flex-1 border-0 bg-white"
                        />
                        {mountEl ? (
                            <FrameEditor mountEl={mountEl} onReady={setEditor} onChange={setHtml} initialContent={initialContent} />
                        ) : null}
                    </ToolPanel>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
