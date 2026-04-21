import { Metadata } from "next";
import { JWTDecoderClient } from "./JWTDecoderClient";

export const metadata: Metadata = {
    title: "JWT Decoder - Giải mã JSON Web Token trực tuyến",
    description:
        "Công cụ giải mã JWT (JSON Web Token) để xem nội dung Header và Payload. An toàn, bảo mật và xử lý hoàn toàn trên trình duyệt.",
};

export default function JWTDecoderPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">JWT Decoder</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Giải mã nhanh các chuỗi JSON Web Token (JWT) để kiểm tra thông tin Header, Claims và Payload.
                </p>
            </div>

            <JWTDecoderClient />
        </div>
    );
}
