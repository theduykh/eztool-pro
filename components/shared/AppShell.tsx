"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const openSidebar = useCallback(() => setSidebarOpen(true), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-background font-sans antialiased">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            {/* Main content area */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header onMenuClick={openSidebar} />

                {/* Tool workspace */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col min-h-full">
                        <div className="flex-1 p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl">
                                {children}
                            </div>
                        </div>
                        <Footer />
                    </div>
                </div>
            </main>
        </div>
    );
}
