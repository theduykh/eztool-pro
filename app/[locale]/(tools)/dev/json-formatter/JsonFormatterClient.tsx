"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { formatJson, minifyJson, type JsonFormatResult } from "@/lib/formatters/json";
import {
    AlignLeft,
    Minimize2,
    Trash2,
    ClipboardPaste,
    Copy,
    Check,
    AlertCircle,
    GripVertical,
    Search,
    X,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

// ─── Search helpers ───────────────────────────────────────────────────────────

interface Match {
    start: number;
    end: number;
}

function findTextMatches(text: string, query: string): Match[] {
    if (!query) return [];
    const matches: Match[] = [];
    const lower = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let idx = 0;
    while ((idx = lower.indexOf(lowerQuery, idx)) !== -1) {
        matches.push({ start: idx, end: idx + query.length });
        idx += query.length;
    }
    return matches;
}

// ─── JSONPath engine ──────────────────────────────────────────────────────────

type PathToken =
    | { type: "root" }
    | { type: "child"; key: string }
    | { type: "index"; idx: number }
    | { type: "wildcard" }
    | { type: "deep"; key: string }
    | { type: "deep_wildcard" };

function tokenizeJsonPath(path: string): PathToken[] {
    const tokens: PathToken[] = [{ type: "root" }];
    let i = path.startsWith("$") ? 1 : 0;

    while (i < path.length) {
        if (path[i] === ".") {
            if (path[i + 1] === ".") {
                i += 2;
                if (path[i] === "*") {
                    tokens.push({ type: "deep_wildcard" });
                    i++;
                } else {
                    const s = i;
                    while (i < path.length && path[i] !== "." && path[i] !== "[") i++;
                    const key = path.slice(s, i);
                    if (key) tokens.push({ type: "deep", key });
                }
            } else {
                i++;
                if (path[i] === "*") {
                    tokens.push({ type: "wildcard" });
                    i++;
                } else {
                    const s = i;
                    while (i < path.length && path[i] !== "." && path[i] !== "[") i++;
                    const key = path.slice(s, i);
                    if (key) tokens.push({ type: "child", key });
                }
            }
        } else if (path[i] === "[") {
            i++;
            if (path[i] === "*") {
                tokens.push({ type: "wildcard" });
                i += 2;
            } else if (path[i] === "'") {
                i++;
                const s = i;
                while (i < path.length && path[i] !== "'") i++;
                tokens.push({ type: "child", key: path.slice(s, i) });
                i += 2;
            } else {
                const s = i;
                while (i < path.length && path[i] !== "]") i++;
                const n = parseInt(path.slice(s, i), 10);
                if (!isNaN(n)) tokens.push({ type: "index", idx: n });
                i++;
            }
        } else {
            const s = i;
            while (i < path.length && path[i] !== "." && path[i] !== "[") i++;
            const key = path.slice(s, i);
            if (key) tokens.push({ type: "child", key });
        }
    }
    return tokens;
}

/**
 * Parse a concrete linePathMap path (e.g. "$.store.book[0].price")
 * into segments: ["$", ".store", ".book", "[0]", ".price"]
 */
function parsePathSegments(path: string): string[] {
    if (path === "$") return ["$"];
    const segs: string[] = ["$"];
    let i = 1;
    while (i < path.length) {
        if (path[i] === ".") {
            const start = i++;
            while (i < path.length && path[i] !== "." && path[i] !== "[") i++;
            segs.push(path.slice(start, i));
        } else if (path[i] === "[") {
            const start = i;
            while (i < path.length && path[i] !== "]") i++;
            segs.push(path.slice(start, ++i));
        } else i++;
    }
    return segs;
}

function matchSegments(segs: string[], si: number, toks: PathToken[], ti: number): boolean {
    if (ti >= toks.length) return si >= segs.length;
    const tok = toks[ti];
    switch (tok.type) {
        case "root":
            return si < segs.length && segs[si] === "$" && matchSegments(segs, si + 1, toks, ti + 1);
        case "child":
            return si < segs.length && segs[si] === `.${tok.key}` && matchSegments(segs, si + 1, toks, ti + 1);
        case "index": {
            if (si >= segs.length) return false;
            const expected = tok.idx >= 0 ? `[${tok.idx}]` : null;
            const ok = expected !== null ? segs[si] === expected : /^\[\d+\]$/.test(segs[si]);
            return ok && matchSegments(segs, si + 1, toks, ti + 1);
        }
        case "wildcard":
            return (
                si < segs.length &&
                (segs[si].startsWith(".") || segs[si].startsWith("[")) &&
                matchSegments(segs, si + 1, toks, ti + 1)
            );
        case "deep":
            for (let skip = 0; si + skip < segs.length; skip++) {
                if (segs[si + skip] === `.${tok.key}`) {
                    if (matchSegments(segs, si + skip + 1, toks, ti + 1)) return true;
                }
            }
            return false;
        case "deep_wildcard":
            for (let skip = 0; si + skip <= segs.length; skip++) {
                if (matchSegments(segs, si + skip, toks, ti + 1)) return true;
            }
            return false;
    }
}

function pathMatchesQuery(linePath: string, tokens: PathToken[]): boolean {
    return matchSegments(parsePathSegments(linePath), 0, tokens, 0);
}

/**
 * Extract the character range to highlight for a matching line.
 * - key→scalar  : highlight the value
 * - key→{/[     : highlight the key name (value is composite)
 * - bare {/[    : highlight the opening brace (array object/array element)
 * - closing }   : skip (return null)
 */
function getHighlightRange(line: string, lineOffset: number): Match | null {
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (/^[}\]],?$/.test(trimmed)) return null; // closing brace/bracket

    const indent = line.length - line.trimStart().length;

    // Bare opening brace — array element whose value is object/array
    if (trimmed === "{" || trimmed === "[") {
        return { start: lineOffset + indent, end: lineOffset + indent + 1 };
    }

    // Key-value line: "key": value[,]
    const kvMatch = line.match(/^(\s*"(?:[^"\\]|\\.)*":\s*)(.*?)(?:,\s*)?$/);
    if (kvMatch) {
        const prefix = kvMatch[1];
        const value = kvMatch[2];
        if (value === "{" || value === "[") {
            // Composite value → highlight the key name only
            const keyMatch = line.match(/^(\s*)("(?:[^"\\]|\\.)*")/);
            if (!keyMatch) return null;
            return {
                start: lineOffset + keyMatch[1].length,
                end: lineOffset + keyMatch[1].length + keyMatch[2].length,
            };
        }
        // Scalar value → highlight the value
        return { start: lineOffset + prefix.length, end: lineOffset + prefix.length + value.length };
    }

    // Scalar array element
    const scalar = trimmed.replace(/,\s*$/, "");
    return { start: lineOffset + indent, end: lineOffset + indent + scalar.length };
}

/**
 * Match a JSON path query against the pre-built linePathMap.
 * Each matching line's highlight range is computed directly from the formatted text —
 * no value-based text search, so duplicate values in the JSON never cause false positives.
 */
function findJsonPathMatches(outputText: string, query: string, linePathMap: string[]): Match[] {
    if (!query || !outputText || linePathMap.length === 0) return [];
    let tokens: PathToken[];
    try { tokens = tokenizeJsonPath(query); } catch { return []; }
    if (tokens.length <= 1) return [];

    const lines = outputText.split("\n");
    const all: Match[] = [];
    let charOffset = 0;

    for (let i = 0; i < lines.length; i++) {
        if (linePathMap[i] && pathMatchesQuery(linePathMap[i], tokens)) {
            const m = getHighlightRange(lines[i], charOffset);
            if (m) all.push(m);
        }
        charOffset += lines[i].length + 1;
    }

    // Deduplicate by start position (opening+closing brace share same path)
    const seen = new Set<number>();
    return all.filter((m) => {
        if (seen.has(m.start)) return false;
        seen.add(m.start);
        return true;
    });
}

// ─── JSON path-per-line builder ───────────────────────────────────────────────

interface Frame {
    path: string;
    type: "object" | "array";
    arrayIndex: number;
}

function buildLinePathMap(formattedJson: string): string[] {
    const lines = formattedJson.split("\n");
    const result: string[] = [];
    const stack: Frame[] = [];

    const top = () => stack[stack.length - 1] ?? null;

    const keyPath = (key: string) => {
        const p = top();
        if (!p) return `$.${key}`;
        return p.path === "$" ? `$.${key}` : `${p.path}.${key}`;
    };

    for (const line of lines) {
        const t = line.trim();

        // Closing object
        if (t.startsWith("}")) {
            const f = top();
            result.push(f?.path ?? "$");
            if (f?.type === "object") stack.pop();
            // Increment parent array index now that we finished this element
            const p = top();
            if (p?.type === "array") p.arrayIndex++;
            continue;
        }

        // Closing array
        if (t.startsWith("]")) {
            const f = top();
            result.push(f?.path ?? "$");
            if (f?.type === "array") stack.pop();
            const p = top();
            if (p?.type === "array") p.arrayIndex++;
            continue;
        }

        // "key": value
        const kv = t.match(/^"((?:[^"\\]|\\.)*)"\s*:\s*(.+)$/);
        if (kv) {
            const key = kv[1];
            const rest = kv[2].trim().replace(/,\s*$/, "");
            const thisPath = keyPath(key);
            result.push(thisPath);
            if (rest === "{") stack.push({ path: thisPath, type: "object", arrayIndex: 0 });
            else if (rest === "[") stack.push({ path: thisPath, type: "array", arrayIndex: 0 });
            continue;
        }

        // Opening { (root or array element)
        if (t === "{" || t === "{,") {
            const p = top();
            if (!p) {
                result.push("$");
                stack.push({ path: "$", type: "object", arrayIndex: 0 });
            } else if (p.type === "array") {
                const thisPath = `${p.path}[${p.arrayIndex}]`;
                result.push(thisPath);
                stack.push({ path: thisPath, type: "object", arrayIndex: 0 });
                // arrayIndex increments when this } is closed
            } else {
                result.push(p.path);
            }
            continue;
        }

        // Opening [ (root or nested array element)
        if (t === "[" || t === "[,") {
            const p = top();
            if (!p) {
                result.push("$");
                stack.push({ path: "$", type: "array", arrayIndex: 0 });
            } else if (p.type === "array") {
                const thisPath = `${p.path}[${p.arrayIndex}]`;
                result.push(thisPath);
                stack.push({ path: thisPath, type: "array", arrayIndex: 0 });
                // arrayIndex increments when ] is closed
            } else {
                result.push(p.path);
            }
            continue;
        }

        // Scalar array element
        const p = top();
        if (p?.type === "array") {
            const thisPath = `${p.path}[${p.arrayIndex}]`;
            result.push(thisPath);
            p.arrayIndex++;
        } else {
            result.push(p?.path ?? "$");
        }
    }

    return result;
}

const DEFAULT_JSON = `{
    "name": "eztool.pro",
    "version": "1.0.0",
    "description": "Bộ công cụ tiện ích trực tuyến siêu tốc dành cho lập trình viên",
    "active": true,
    "stats": {
        "users": 2500,
        "rating": 4.9,
        "latency_ms": 12
    },
    "features": [
        "JSON Formatter & Minifier",
        "Base64 Encode/Decode",
        "URL Encode/Decode",
        "Hash Generator",
        "JWT Decoder"
    ],
    "tags": [
        "developer",
        "utility",
        "free"
    ],
    "author": {
        "name": "theduykh",
        "github": "github.com/theduykh"
    }
}`;

// ─── Component ────────────────────────────────────────────────────────────────

export function JsonFormatterClient() {
    const [input, setInput] = useState(DEFAULT_JSON);
    const [output, setOutput] = useState(DEFAULT_JSON);
    const [hasError, setHasError] = useState(false);
    const [copied, setCopied] = useState(false);

    // Search
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchMode, setSearchMode] = useState<"text" | "jsonpath">("text");
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Clicked-line path
    const [clickedLine, setClickedLine] = useState<number | null>(null);
    const [clickedPath, setClickedPath] = useState<string | null>(null);
    const [pathCopied, setPathCopied] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Line→path map (must come before matches) ──────────────────────────────

    const linePathMap = useMemo(() => {
        if (!output || hasError) return [];
        try { return buildLinePathMap(output); } catch { return []; }
    }, [output, hasError]);

    // ── Search matches ────────────────────────────────────────────────────────

    const matches = useMemo(() => {
        if (!searchOpen || !searchQuery || !output || hasError) return [];
        if (searchMode === "text") return findTextMatches(output, searchQuery);
        return findJsonPathMatches(output, searchQuery, linePathMap);
    }, [searchOpen, searchQuery, searchMode, output, hasError, linePathMap]);

    useEffect(() => { setCurrentMatchIndex(0); }, [matches.length, searchQuery, searchMode]);

    useEffect(() => {
        if (matches.length === 0) return;
        document.getElementById("search-current-match")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [currentMatchIndex, matches]);

    useEffect(() => {
        if (searchOpen) {
            const t = setTimeout(() => searchInputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [searchOpen]);

    // ── Output render (line-by-line for click highlighting + search marks) ────

    const renderedOutput = useMemo(() => {
        if (!output) return null;

        const lines = output.split("\n");
        let charPos = 0;

        return lines.map((line, lineIdx) => {
            const lineStart = charPos;
            const lineEnd = charPos + line.length;
            charPos = lineEnd + 1; // +1 for \n

            const lineMatches = matches.filter((m) => m.start < lineEnd && m.end > lineStart);

            let content: React.ReactNode;
            if (lineMatches.length === 0) {
                content = line || "​"; // zero-width space keeps empty lines clickable
            } else {
                const parts: React.ReactNode[] = [];
                let pos = lineStart;
                for (const match of lineMatches) {
                    const mStart = Math.max(match.start, lineStart);
                    const mEnd = Math.min(match.end, lineEnd);
                    if (mStart > pos) parts.push(output.slice(pos, mStart));
                    const mIdx = matches.indexOf(match);
                    parts.push(
                        <mark
                            key={mStart}
                            id={mIdx === currentMatchIndex ? "search-current-match" : undefined}
                            className={cn(
                                "rounded-sm",
                                mIdx === currentMatchIndex
                                    ? "bg-orange-400 text-black ring-1 ring-orange-500"
                                    : "bg-yellow-300 text-black",
                            )}
                        >
                            {output.slice(mStart, mEnd)}
                        </mark>,
                    );
                    pos = mEnd;
                }
                if (pos < lineEnd) parts.push(output.slice(pos, lineEnd));
                content = parts;
            }

            return (
                <span
                    key={lineIdx}
                    data-line={lineIdx}
                    className={cn(
                        "block rounded-sm px-0.5 -mx-0.5 transition-colors",
                        lineIdx === clickedLine
                            ? "bg-blue-500/15"
                            : "hover:bg-muted/60",
                    )}
                >
                    {content}
                    {lineIdx < lines.length - 1 ? "\n" : ""}
                </span>
            );
        });
    }, [output, matches, currentMatchIndex, clickedLine]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleProcess = useCallback(
        (mode: "format" | "minify") => {
            const result: JsonFormatResult =
                mode === "format" ? formatJson(input) : minifyJson(input);
            if (result.success) {
                setOutput(result.data);
                setHasError(false);
            } else {
                setOutput("❌ Lỗi định dạng JSON:\n" + result.error);
                setHasError(true);
            }
            setClickedLine(null);
            setClickedPath(null);
        },
        [input],
    );

    const handleClear = useCallback(() => {
        setInput("");
        setOutput("");
        setHasError(false);
        setSearchOpen(false);
        setSearchQuery("");
        setClickedLine(null);
        setClickedPath(null);
    }, []);



    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
            const result = formatJson(text);
            if (result.success) { setOutput(result.data); setHasError(false); }
            else { setOutput("❌ Lỗi định dạng JSON:\n" + result.error); setHasError(true); }
        } catch { /* Clipboard API may be blocked */ }
    }, []);

    const handleCopy = useCallback(async () => {
        if (!output || hasError) return;
        try {
            await navigator.clipboard.writeText(output);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = output;
            ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [output, hasError]);

    const applyFormat = useCallback((text: string) => {
        if (!text.trim()) { setOutput(""); setHasError(false); return; }
        const result = formatJson(text);
        if (result.success) { setOutput(result.data); setHasError(false); }
        else { setOutput("❌ Lỗi định dạng JSON:\n" + result.error); setHasError(true); }
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => applyFormat(val), 600);
    }, [applyFormat]);

    const handleInputPaste = useCallback(() => {
        // Paste fires before onChange, so read value after DOM update
        setTimeout(() => {
            const el = document.getElementById("input-json") as HTMLTextAreaElement | null;
            if (!el) return;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            applyFormat(el.value);
        }, 10);
    }, [applyFormat]);

    const navigateMatch = useCallback(
        (dir: "prev" | "next") => {
            if (matches.length === 0) return;
            setCurrentMatchIndex((i) =>
                dir === "next" ? (i + 1) % matches.length : (i - 1 + matches.length) % matches.length,
            );
        },
        [matches.length],
    );

    const handleSearchKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") { e.shiftKey ? navigateMatch("prev") : navigateMatch("next"); }
            else if (e.key === "Escape") { setSearchOpen(false); }
        },
        [navigateMatch],
    );

    const handleOutputClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!output || hasError || linePathMap.length === 0) return;
            const target = (e.target as HTMLElement).closest("[data-line]") as HTMLElement | null;
            if (!target) return;
            const lineIdx = parseInt(target.dataset.line ?? "0", 10);
            setClickedLine(lineIdx);
            setClickedPath(linePathMap[lineIdx] ?? "$");
        },
        [output, hasError, linePathMap],
    );

    const handleCopyPath = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!clickedPath) return;
        try {
            await navigator.clipboard.writeText(clickedPath);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = clickedPath;
            ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        setPathCopied(true);
        setTimeout(() => setPathCopied(false), 1500);
    }, [clickedPath]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ResizablePanelGroup
                orientation="horizontal"
                className="min-h-[200px] flex-1 md:min-h-[400px]"
            >
                {/* ── Input panel ── */}
                <ResizablePanel defaultSize={50} minSize={20}>
                    <ToolPanel
                        padding="none"
                        className="h-full"
                        bodyClassName="h-full"
                        header={
                            <>
                                <ToolLabel>Input</ToolLabel>
                                <div className="flex items-center gap-3">
                                    <button
                                        id="btn-paste"
                                        onClick={handlePaste}
                                        className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <ClipboardPaste className="mr-1 size-3.5" />
                                        Paste
                                    </button>
                                    <button
                                        id="btn-clear"
                                        onClick={handleClear}
                                        className="flex items-center text-xs text-destructive/85 transition-colors hover:text-destructive"
                                        title="Xóa trắng nội dung"
                                    >
                                        <Trash2 className="mr-1 size-3.5" />
                                        Clear
                                    </button>
                                </div>
                            </>
                        }
                    >
                        <textarea
                            id="input-json"
                            value={input}
                            onChange={handleInputChange}
                            onPaste={handleInputPaste}
                            className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                            placeholder={'Example: {"name": "eztool", "status": "active"}'}
                            spellCheck={false}
                        />
                    </ToolPanel>
                </ResizablePanel>

                <ResizableHandle className="w-4 cursor-col-resize bg-transparent transition-colors duration-150 hover:bg-accent/50 active:bg-accent/70 data-[resize-handle-active]:bg-accent/70">
                    <div className="z-10 flex h-8 w-4 items-center justify-center rounded-sm border bg-border shadow-sm">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                    </div>
                </ResizableHandle>

                {/* ── Output panel ── */}
                <ResizablePanel defaultSize={50} minSize={20}>
                    <ToolPanel
                        padding="none"
                        className="h-full"
                        bodyClassName="flex h-full flex-col"
                        header={
                            <>
                                <div className="flex items-center gap-2">
                                    <ToolLabel>Output</ToolLabel>
                                    {hasError && <AlertCircle className="size-3.5 text-destructive" />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        id="btn-format"
                                        onClick={() => handleProcess("format")}
                                        className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                                        title="Làm đẹp JSON"
                                    >
                                        <AlignLeft className="mr-1 size-3.5" />
                                        Format
                                    </button>
                                    <button
                                        id="btn-minify"
                                        onClick={() => handleProcess("minify")}
                                        className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                                        title="Nén JSON"
                                    >
                                        <Minimize2 className="mr-1 size-3.5" />
                                        Minify
                                    </button>
                                    <button
                                        id="btn-search"
                                        onClick={() => setSearchOpen((v) => !v)}
                                        className={cn(
                                            "flex items-center text-xs transition-colors",
                                            searchOpen
                                                ? "text-blue-500 hover:text-blue-400"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                        title="Tìm kiếm trong output"
                                    >
                                        <Search className="mr-1 size-3.5" />
                                        Search
                                    </button>
                                    <button
                                        id="btn-copy"
                                        onClick={handleCopy}
                                        className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="mr-1 size-3.5 text-green-500" />
                                                Đã copy!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-1 size-3.5" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        }
                    >
                        {/* Search bar */}
                        {searchOpen && (
                            <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
                                <div className="flex shrink-0 overflow-hidden rounded border border-border text-xs">
                                    <button
                                        id="opt-search-text"
                                        onClick={() => setSearchMode("text")}
                                        className={cn(
                                            "px-2 py-1 transition-colors",
                                            searchMode === "text"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-transparent text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        Text
                                    </button>
                                    <button
                                        id="opt-search-jsonpath"
                                        onClick={() => setSearchMode("jsonpath")}
                                        className={cn(
                                            "border-l border-border px-2 py-1 transition-colors",
                                            searchMode === "jsonpath"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-transparent text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        JSON Path
                                    </button>
                                </div>
                                <input
                                    ref={searchInputRef}
                                    id="input-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder={
                                        searchMode === "text"
                                            ? "Tìm kiếm... (Enter để next)"
                                            : "$.key hoặc data.users[0].name"
                                    }
                                    className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                    {matches.length > 0
                                        ? `${currentMatchIndex + 1}/${matches.length}`
                                        : searchQuery
                                            ? "0 kết quả"
                                            : ""}
                                </span>
                                <button
                                    id="btn-search-prev"
                                    onClick={() => navigateMatch("prev")}
                                    disabled={matches.length === 0}
                                    className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                                    title="Kết quả trước (Shift+Enter)"
                                >
                                    <ChevronUp className="size-4" />
                                </button>
                                <button
                                    id="btn-search-next"
                                    onClick={() => navigateMatch("next")}
                                    disabled={matches.length === 0}
                                    className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                                    title="Kết quả tiếp (Enter)"
                                >
                                    <ChevronDown className="size-4" />
                                </button>
                                <button
                                    id="btn-search-close"
                                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                    className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                                    title="Đóng (Esc)"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Output content */}
                        <div
                            id="output-json"
                            onClick={handleOutputClick}
                            className={cn(
                                "min-h-0 flex-1 cursor-text overflow-auto p-4 font-mono text-sm",
                                hasError ? "text-destructive" : "text-foreground",
                            )}
                        >
                            {output ? (
                                <pre className="whitespace-pre-wrap break-all">{renderedOutput}</pre>
                            ) : (
                                <pre className="whitespace-pre-wrap text-muted-foreground">{`{
  "name": "eztool",
  "status": "active"
}`}</pre>
                            )}
                        </div>

                        {/* JSON path status bar */}
                        {clickedPath !== null && (
                            <div className="flex shrink-0 items-center gap-2 border-t border-border bg-muted/30 px-3 py-1.5">
                                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                                    path
                                </span>
                                <code
                                    id="output-clicked-path"
                                    className="min-w-0 flex-1 truncate font-mono text-xs text-blue-500"
                                    title={clickedPath}
                                >
                                    {clickedPath}
                                </code>
                                <button
                                    id="btn-copy-path"
                                    onClick={handleCopyPath}
                                    className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                                    title="Copy path"
                                >
                                    {pathCopied ? (
                                        <Check className="size-3 text-green-500" />
                                    ) : (
                                        <Copy className="size-3" />
                                    )}
                                </button>
                                <button
                                    id="btn-clear-path"
                                    onClick={() => { setClickedLine(null); setClickedPath(null); }}
                                    className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                                    title="Đóng"
                                >
                                    <X className="size-3" />
                                </button>
                            </div>
                        )}
                    </ToolPanel>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
