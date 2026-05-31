import { useTranslations } from "next-intl";
import { Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const t = useTranslations("notFound");

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
            <p className="text-7xl font-bold text-muted-foreground/30">404</p>
            <div>
                <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("body")}</p>
            </div>
            <Button asChild size="lg">
                <Link href="/">
                    <Home data-icon="inline-start" />
                    {t("backHome")}
                </Link>
            </Button>
        </div>
    );
}
