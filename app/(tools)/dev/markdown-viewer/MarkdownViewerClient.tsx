"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { FileText, Eye, GripVertical } from "lucide-react";

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

    return (
        <div className="flex flex-1 min-h-0 overflow-hidden h-full p-4 md:p-6">
            <ResizablePanelGroup orientation="horizontal" className="flex-1 rounded-lg">
                <ResizablePanel defaultSize={50} minSize={20} className="flex flex-col min-h-0">
                    <ToolPanel padding="md" className="flex flex-col flex-1 min-h-0" bodyClassName="flex flex-col flex-1 min-h-0">
                        <ToolLabel icon={<FileText className="size-4" />} htmlFor="input-markdown">
                            Raw Markdown
                        </ToolLabel>
                        <textarea
                            id="input-markdown"
                            className="flex-1 w-full p-4 mt-2 bg-transparent border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-sm leading-relaxed"
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
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

                <ResizablePanel defaultSize={50} minSize={20} className="flex flex-col min-h-0">
                    <ToolPanel padding="md" className="flex flex-col flex-1 min-h-0" bodyClassName="flex flex-col flex-1 min-h-0">
                        <ToolLabel icon={<Eye className="size-4" />}>
                            Preview
                        </ToolLabel>
                        <div className="flex-1 w-full p-6 mt-2 border rounded-md overflow-y-auto bg-card">
                            <div className="prose dark:prose-invert max-w-none w-full break-words">
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
