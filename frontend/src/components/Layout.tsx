import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export default function Layout() {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
