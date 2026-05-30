import { describe, it, expect } from "vitest";
import { formatHtml, minifyHtml, inlineTaskListStyles, inlineTableStyles, inlineExportStyles } from "./html";

describe("formatHtml", () => {
    it("trả về lỗi khi input trống", () => {
        const result = formatHtml("   ");
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toContain("trống");
    });

    it("indent một cấu trúc lồng nhau đơn giản", () => {
        const result = formatHtml("<div><p>Hello</p></div>");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(["<div>", "  <p>", "    Hello", "  </p>", "</div>"].join("\n"));
        }
    });

    it("dùng số space indent tuỳ chỉnh", () => {
        const result = formatHtml("<ul><li>A</li></ul>", 4);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(["<ul>", "    <li>", "        A", "    </li>", "</ul>"].join("\n"));
        }
    });

    it("xử lý thẻ void không tăng độ sâu", () => {
        const result = formatHtml("<div><br><img src='x.png'></div>");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(
                ["<div>", "  <br>", "  <img src='x.png'>", "</div>"].join("\n"),
            );
        }
    });

    it("xử lý thẻ self-closing", () => {
        const result = formatHtml("<div><custom-el/></div>");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(["<div>", "  <custom-el/>", "</div>"].join("\n"));
        }
    });

    it("giữ nguyên DOCTYPE và comment", () => {
        const result = formatHtml("<!DOCTYPE html><!-- hi --><span>x</span>");
        expect(result.success).toBe(true);
        if (result.success) {
            const lines = result.data.split("\n");
            expect(lines[0]).toBe("<!DOCTYPE html>");
            expect(lines[1]).toBe("<!-- hi -->");
        }
    });

    it("giữ nguyên nội dung bên trong thẻ script", () => {
        const result = formatHtml("<div><script>const a=1;\nconst b=2;</script></div>");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toContain("const a=1;");
            expect(result.data).toContain("const b=2;");
        }
    });

    it("gộp khoảng trắng thừa trong text node", () => {
        const result = formatHtml("<p>  hello    world  </p>");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(["<p>", "  hello world", "</p>"].join("\n"));
        }
    });

    it("không để depth âm khi thừa thẻ đóng", () => {
        const result = formatHtml("</div><span>x</span>");
        expect(result.success).toBe(true);
        if (result.success) {
            // không throw và không có indent âm
            expect(result.data.split("\n").every((l) => !l.startsWith(" -"))).toBe(true);
        }
    });
});

describe("inlineTaskListStyles", () => {
    it("thêm style bỏ bullet cho ul taskList", () => {
        const out = inlineTaskListStyles('<ul data-type="taskList"><li data-type="taskItem">x</li></ul>');
        expect(out).toContain('<ul data-type="taskList" style="list-style:none;margin:0;padding:0;">');
    });

    it("thêm style flex cho li taskItem", () => {
        const out = inlineTaskListStyles('<ul data-type="taskList"><li data-checked="false" data-type="taskItem">x</li></ul>');
        expect(out).toContain("display:flex;align-items:flex-start;gap:0.5rem;");
    });

    it("không đụng tới list thường", () => {
        const input = "<ul><li>a</li></ul>";
        expect(inlineTaskListStyles(input)).toBe(input);
    });

    it("idempotent — chạy 2 lần không nhân đôi style", () => {
        const once = inlineTaskListStyles('<ul data-type="taskList"><li data-type="taskItem">x</li></ul>');
        const twice = inlineTaskListStyles(once);
        expect(twice).toBe(once);
    });

    it("gộp vào style sẵn có thay vì ghi đè", () => {
        const out = inlineTaskListStyles('<ul data-type="taskList" style="color:red"><li data-type="taskItem">x</li></ul>');
        expect(out).toContain("color:red;list-style:none;margin:0;padding:0;");
    });

    it("style checkbox và phản ánh trạng thái đã tick", () => {
        const input =
            '<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>x</p></div></li></ul>';
        const out = inlineTaskListStyles(input);
        expect(out).toMatch(/<input\b[^>]*\schecked\b/);
        expect(out).toContain("width:16px;height:16px");
    });

    it("không thêm checked cho item chưa tick", () => {
        const input =
            '<ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"></label><div><p>x</p></div></li></ul>';
        const out = inlineTaskListStyles(input);
        expect(out).not.toContain("<input checked");
        expect(out).toContain('<input style="width:16px');
    });
});

describe("inlineTableStyles", () => {
    it("thêm viền cho table/th/td", () => {
        const out = inlineTableStyles("<table><tr><th>A</th><td>1</td></tr></table>");
        expect(out).toContain("border-collapse:collapse");
        expect(out).toContain('<th style="border:1px solid');
        expect(out).toContain('<td style="border:1px solid');
    });

    it("không đụng vào bảng người dùng đã tự style", () => {
        const input = '<table style="border:2px solid red"><tr><td style="color:blue">x</td></tr></table>';
        expect(inlineTableStyles(input)).toBe(input);
    });

    it("idempotent", () => {
        const once = inlineTableStyles("<table><tr><td>1</td></tr></table>");
        expect(inlineTableStyles(once)).toBe(once);
    });
});

describe("inlineExportStyles", () => {
    it("xử lý cả task list lẫn table trong một lần", () => {
        const input =
            '<table><tr><td>1</td></tr></table><ul data-type="taskList"><li data-type="taskItem">x</li></ul>';
        const out = inlineExportStyles(input);
        expect(out).toContain("border-collapse:collapse");
        expect(out).toContain("list-style:none");
    });
});

describe("minifyHtml", () => {
    it("trả về lỗi khi input trống", () => {
        const result = minifyHtml("");
        expect(result.success).toBe(false);
    });

    it("bỏ khoảng trắng thừa giữa các thẻ", () => {
        const result = minifyHtml("<div>\n  <p>Hello</p>\n</div>");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe("<div> <p>Hello</p> </div>");
        }
    });

    it("giữ nguyên nội dung script khi minify", () => {
        const result = minifyHtml("<script>const a = 1;</script>");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toContain("const a = 1;");
        }
    });
});
