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
        <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Topbar />
                <main className="p-8 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}