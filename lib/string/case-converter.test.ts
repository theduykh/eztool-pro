import { describe, it, expect } from "vitest";
import { convertCase } from "./case-converter";

describe("Case Converter Logic", () => {
    const input = "hello world. this is a TEST.";

    it("should convert to UPPERCASE", () => {
        expect(convertCase(input, "uppercase")).toBe("HELLO WORLD. THIS IS A TEST.");
    });

    it("should convert to lowercase", () => {
        expect(convertCase(input, "lowercase")).toBe("hello world. this is a test.");
    });

    it("should convert to Sentence case", () => {
        expect(convertCase(input, "sentence")).toBe("Hello world. This is a test.");
    });

    it("should convert to Title Case", () => {
        expect(convertCase("hello world", "title")).toBe("Hello World");
    });

    it("should convert to camelCase", () => {
        expect(convertCase("hello world test", "camel")).toBe("helloWorldTest");
    });

    it("should convert to PascalCase", () => {
        expect(convertCase("hello world test", "pascal")).toBe("HelloWorldTest");
    });

    it("should convert to snake_case", () => {
        expect(convertCase("hello world", "snake")).toBe("hello_world");
    });

    it("should convert to kebab-case", () => {
        expect(convertCase("hello world", "kebab")).toBe("hello-world");
    });
});
