"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { FileText, Eye, GripVertical, Minus, Plus } from "lucide-react";

const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 28;
const FONT_SIZE_STEP = 2;
const FONT_SIZE_DEFAULT = 16;

export function MarkdownViewerClient() {
    const [markdown, setMarkdown] = useState<string>(`# Chào mừng đến với Markdown Viewer

Bạn có thể viết **Markdown** ở cột bên trái và xem kết quả hiển thị ở cột bên phải.

## Tính năng hỗ trợ

- **In đậm**, *in nghiêng*, ~~gạch ngang~~
- Danh sách (List)
- Bảng biểu (Table)
- Code block
- Trích dẫn (Blockquote)

### Ví dụ về Bảng

| Cột A | Cột B |
|-------|-------|
| Dữ liệu 1 | Dữ liệu 2 |
| Hàng 2, Cột A | Hàng 2, Cột B |

### Ví dụ về Code

\`\`\`javascript
function helloWorld() {
  console.log("Hello, World!");
}
\`\`\`

> Đây là một đoạn trích dẫn mẫu để kiểm tra hiển thị.
`);

    const [fontSize, setFontSize] = useState(FONT_SIZE_DEFAULT);

    const decreaseFontSize = useCallback(() => {
        setFontSize((prev) => Math.max(FONT_SIZE_MIN, prev - FONT_SIZE_STEP));
    }, []);

    const increaseFontSize = useCallback(() => {
        setFontSize((prev) => Math.min(FONT_SIZE_MAX, prev + FONT_SIZE_STEP));
    }, []);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ResizablePanelGroup orientation="horizontal" className="min-h-[200px] flex-1 md:min-h-[400px]">
                <ResizablePanel defaultSize={50} minSize={20}>
                <ToolPanel
                    padding="none"
                    className="h-full"
                    bodyClassName="h-full"
                    header={
                        <>
                            <ToolLabel icon={<FileText className="size-3.5" />}>
                                Raw Markdown
                            </ToolLabel>
                        </>
                    }
                >
                    <textarea
                        id="input-markdown"
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                        placeholder="Nhập nội dung markdown của bạn ở đây..."
                        spellCheck={false}
                    />
                </ToolPanel>
                </ResizablePanel>

                <ResizableHandle className="w-4 bg-transparent hover:bg-accent/50 active:bg-accent/70 transition-colors duration-150 cursor-col-resize data-[resize-handle-active]:bg-accent/70">
                    <div className="z-10 flex h-8 w-4 items-center justify-center rounded-sm border bg-border shadow-sm">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                    </div>
                </ResizableHandle>

                <ResizablePanel defaultSize={50} minSize={20}>
                <ToolPanel
                    padding="none"
                    className="h-full"
                    bodyClassName="h-full"
                    header={
                        <>
                            <ToolLabel icon={<Eye className="size-3.5" />}>
                                Preview
                            </ToolLabel>
                            <div className="flex items-center gap-1">
                                <button
                                    id="btn-font-increase"
                                    onClick={increaseFontSize}
                                    disabled={fontSize >= FONT_SIZE_MAX}
                                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                                    title="Tăng cỡ chữ"
                                >
                                    <Plus className="size-3.5" />
                                </button>
                                <span className="min-w-[2.5rem] text-center text-xs tabular-nums text-muted-foreground">
                                    {fontSize}px
                                </span>
                                <button
                                    id="btn-font-decrease"
                                    onClick={decreaseFontSize}
                                    disabled={fontSize <= FONT_SIZE_MIN}
                                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                                    title="Giảm cỡ chữ"
                                >
                                    <Minus className="size-3.5" />
                                </button>
                            </div>
                        </>
                    }
                >
                    <div className="h-full w-full overflow-y-auto bg-muted/20 p-4">
                        <div
                            className="prose dark:prose-invert max-w-none w-full break-words"
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </ToolPanel>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

