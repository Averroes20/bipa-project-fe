import type { ReactNode } from "react"
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Props {
    children: ReactNode;
}

export default function DashboardLayout({
    children,
}: Props){
    return (
        <div className="flex bg-slate-950 min-h-screen text-slate-50 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Topbar />
                <main className="p-8 relative">
                    {/* Subtle background glow effect */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
                    {children}
                </main>
            </div>
        </div>
    );
}