"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartPulse, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f4faf8] flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#55716a]"
        >
          <ArrowLeft size={17} />
          Back to MediMate
        </Link>

        <div className="rounded-[28px] border border-[#dcebe7] bg-white p-8 shadow-xl">

          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087f6a] text-white">
              <HeartPulse />
            </div>

            <div>
              <h1 className="text-xl font-black">
                MediMate <span className="text-[#087f6a]">AI</span>
              </h1>
              <p className="text-xs text-[#71847f]">
                Welcome back
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-black">
            Sign in
          </h2>

          <p className="mt-2 text-sm text-[#6b7e79]">
            Continue to your MediMate health dashboard.
          </p>

          <form onSubmit={handleLogin} className="mt-7 space-y-5">

            <div>
              <label className="text-sm font-bold">Email</label>

              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d6e4e0] px-4 py-3 outline-none focus:border-[#087f6a]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-bold">Password</label>

              <div className="relative mt-2">

                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#d6e4e0] px-4 py-3 pr-12 outline-none focus:border-[#087f6a]"
                  placeholder="Your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-[#71847f]"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>

              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#087f6a] py-3.5 font-bold text-white hover:bg-[#056452] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-[#687b76]">
            New to MediMate?{" "}
            <Link href="/signup" className="font-bold text-[#087f6a]">
              Create account
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}