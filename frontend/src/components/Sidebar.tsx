import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    PlusCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div
            className={cn(
                "min-h-screen bg-card border-r transition-all duration-300 flex flex-col",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="p-4 h-20 border-b flex items-center justify-s">
                {!collapsed && (
                    <div className="flex items-center gap-3 overflow-hidden px-1">
                        <div className="h-14 flex items-center">
                            <img
                                src="/2.svg"
                                alt="Brand Logo"
                                className="h-full object-cover object-center"
                            />
                        </div>
                        <div className="h-14 w-28 flex flex-col items-center pt-2   ">
                            <img
                                src="/3.svg"
                                alt="Brand Name"
                                className="w-full object-cover object-center"
                            />
                            <p className="text-xs text-gray-500">
                                Admin Dashboard
                            </p>
                        </div>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <nav className="flex-1 flex flex-col p-2 gap-2">
                <Link to="/dashboard">
                    <Button
                        variant={
                            location.pathname === "/dashboard"
                                ? "secondary"
                                : "ghost"
                        }
                        className={cn(
                            "w-full flex",
                            collapsed
                                ? "px-2 justify-center items-center"
                                : "px-4 justify-start items-center"
                        )}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        {!collapsed && <span className="ml-2">Dashboard</span>}
                    </Button>
                </Link>

                <Link to="/add-sale">
                    <Button
                        variant={
                            location.pathname === "/add-sale"
                                ? "secondary"
                                : "ghost"
                        }
                        className={cn(
                            "w-full flex",
                            collapsed
                                ? "px-2 justify-center items-center"
                                : "px-4 justify-start items-center"
                        )}
                    >
                        <PlusCircle className="h-5 w-5" />
                        {!collapsed && <span className="ml-2">Add Sale</span>}
                    </Button>
                </Link>
            </nav>

            <div className="p-4 border-t">
                {!collapsed && (
                    <div className="text-xs text-muted-foreground text-center space-y-1 animate-in fade-in duration-300">
                        <p className="font-medium">Made by Leon Destura</p>
                        <p className="text-[10px] opacity-70">
                            © 2025 Shanka Dashboard
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
