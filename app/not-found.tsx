import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
            <p className="text-7xl font-bold text-muted-foreground/30">404</p>
            <div>
                <h2 className="text-xl font-semibold text-foreground">
                    Không tìm thấy trang
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
            </div>
            <Button asChild size="lg">
                <Link href="/">
                    <Home data-icon="inline-start" />
                    Quay về trang chủ
                </Link>
            </Button>
        </div>
    );
}
