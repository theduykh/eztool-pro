import { Metadata } from "next";
import { JWTDecoderClient } from "./JWTDecoderClient";

export const metadata: Metadata = {
    title: "JWT Decoder - Giải mã JSON Web Token trực tuyến",
    description:
        "Công cụ giải mã JWT (JSON Web Token) để xem nội dung Header và Payload. An toàn, bảo mật và xử lý hoàn toàn trên trình duyệt.",
};

export default function JWTDecoderPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">JWT Decoder</h1>
                <p className="text-muted-foreground">
                    Giải mã nhanh các chuỗi JSON Web Token (JWT) để kiểm tra thông tin Header, Claims và Payload. Lưu ý: Công cụ này chỉ giải mã để xem nội dung, không thực hiện xác thực chữ ký (Signature Verification).
                </p>
            </div>

            <JWTDecoderClient />
        </div>
    );
}
