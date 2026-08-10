"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name,
        });

        if (error) {
            setError(error.message || "An error occurred during registration");
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Join Logged and start tracking logs in seconds.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Name</label>
                            <input
                                type="text"
                                required
                                className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <input
                                type="email"
                                required
                                className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <input
                                type="password"
                                required
                                className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:text-primary-light transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
