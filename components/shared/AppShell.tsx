"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

    const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
    const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
    const toggleDesktopSidebar = useCallback(
        () => setDesktopSidebarCollapsed((v) => !v),
        [],
    );

    const pathname = usePathname();
    const tool = TOOLS_DIRECTORY.find((t) => t.path === pathname);

    // full-width tools: no max-width constraint
    // fixed tools: centered narrow (calculators, simple forms)
    // homepage / other: moderate centered width
    const isFullLayout = tool?.layout === "full";

    const contentWrapperClass = isFullLayout
        ? "w-full"
        : tool?.layout === "fixed"
          ? "mx-auto w-full max-w-3xl"
          : "mx-auto w-full max-w-6xl";

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-background font-sans antialiased">
            <Sidebar
                isOpen={mobileSidebarOpen}
                onClose={closeMobileSidebar}
                isDesktopCollapsed={desktopSidebarCollapsed}
            />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    onMobileMenuClick={openMobileSidebar}
                    onDesktopSidebarToggle={toggleDesktopSidebar}
                    desktopSidebarCollapsed={desktopSidebarCollapsed}
                />

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {/* full-layout: h-full chain so children can fill viewport height */}
                        {/* other layouts: min-h-full so content can grow beyond viewport */}
                        <div className={cn("flex flex-col", isFullLayout ? "h-full" : "min-h-full")}>
                            <div className={cn(
                                "flex-1 p-4 md:p-6",
                                isFullLayout && "flex min-h-0 flex-col",
                            )}>
                                <div className={cn(
                                    contentWrapperClass,
                                    isFullLayout && "flex min-h-0 flex-1 flex-col",
                                )}>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </main>
        </div>
    );
}
