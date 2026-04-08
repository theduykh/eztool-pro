import Link from "next/link";
import { Code, QrCode, ArrowRight } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center py-16">
            {/* Hero */}
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    eztool<span className="text-blue-600 dark:text-blue-400">.pro</span>
                </h1>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                    Bộ công cụ tiện ích siêu tốc dành cho lập trình viên và người dùng
                    hàng ngày. Nhanh chóng, chính xác, không quảng cáo.
                </p>
            </div>

            {/* Featured tools */}
            <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                    href="/dev/json-formatter"
                    className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md"
                >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Code className="size-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">
                            JSON Formatter
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Làm đẹp, xác thực và nén dữ liệu JSON ngay lập tức.
                        </p>
                    </div>
                    <span className="mt-auto inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        Mở công cụ
                        <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </Link>

                <Link
                    href="/image/qr-generator"
                    className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md"
                >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <QrCode className="size-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">
                            Tạo mã QR Code
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tạo mã QR cho link, văn bản, wifi — tùy chỉnh màu sắc.
                        </p>
                    </div>
                    <span className="mt-auto inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        Mở công cụ
                        <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </Link>
            </div>
        </div>
    );
}
