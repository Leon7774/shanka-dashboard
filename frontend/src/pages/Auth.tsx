import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import ThreeBackground from "@/components/ThreeBackground";

export default function Auth() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Auth: Accept anything
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <ThreeBackground />

            {/* Updated card for Light Background: Dark text, subtle border/shadow */}

            <Card className="w-[50vw] h-[80%] min-w-[600px] gap-10 justify-center flex flex-row items-center z-10 shadow-2xl animate-in fade-in zoom-in duration-500 bg-white/70 backdrop-blur-md border border-gray-200 dark:bg-slate-900/70 dark:border-slate-800">
                <div className="flex flex-col items-center">
                    <img className="w-[200px]" src="2.svg" alt="logo" />
                    <div className="flex flex-col items-center">
                        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Shanka
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            We love milking your wallet
                        </p>
                    </div>
                </div>
                <div>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                            Enter your credentials to access the dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="username"
                                    className="text-gray-700 dark:text-gray-200"
                                >
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    required
                                    className="bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 dark:bg-slate-950/50 dark:border-slate-700 dark:text-white dark:placeholder:text-gray-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-gray-700 dark:text-gray-200"
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 dark:bg-slate-950/50 dark:border-slate-700 dark:text-white dark:placeholder:text-gray-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-md dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center text-xs text-gray-400">
                        <span>By Destura™</span>
                    </CardFooter>
                </div>
            </Card>
        </div>
    );
}
