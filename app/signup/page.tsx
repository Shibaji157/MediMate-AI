"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, HeartPulse } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "caregiver">("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setIsError(true);
        setMessage(error.message);
        return;
      }

      setMessage(
        "Account created successfully. Please check your email and verify your account before signing in."
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setRole("patient");
    } catch {
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4faf8] px-6 py-12">
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
              <HeartPulse size={23} />
            </div>

            <div>
              <h1 className="text-xl font-black">
                MediMate <span className="text-[#087f6a]">AI</span>
              </h1>
              <p className="text-xs text-[#71847f]">
                Agentic AI Health Companion
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-black">Create your account</h2>

          <p className="mt-2 text-sm leading-6 text-[#6b7e79]">
            Start managing your medication routine with MediMate.
          </p>

          <form onSubmit={handleSignup} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="text-sm font-bold text-[#243d37]"
              >
                Full Name
              </label>

              <input
                id="fullName"
                required
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-xl border border-[#d6e4e0] px-4 py-3 outline-none transition focus:border-[#087f6a] focus:ring-2 focus:ring-[#087f6a]/10"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-bold text-[#243d37]"
              >
                Email Address
              </label>

              <input
                id="email"
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-[#d6e4e0] px-4 py-3 outline-none transition focus:border-[#087f6a] focus:ring-2 focus:ring-[#087f6a]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-bold text-[#243d37]"
              >
                Password
              </label>

              <div className="relative mt-2">
                <input
                  id="password"
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-[#d6e4e0] px-4 py-3 pr-12 outline-none transition focus:border-[#087f6a] focus:ring-2 focus:ring-[#087f6a]/10"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71847f]"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-[#788b86]">
                Use at least 8 characters.
              </p>
            </div>

            <fieldset>
              <legend className="text-sm font-bold text-[#243d37]">
                I am using MediMate as
              </legend>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`rounded-xl border p-3 text-sm font-bold transition ${
                    role === "patient"
                      ? "border-[#087f6a] bg-[#eaf7f3] text-[#087f6a]"
                      : "border-[#dce6e3] bg-white text-[#566c66]"
                  }`}
                >
                  Patient
                </button>

                <button
                  type="button"
                  onClick={() => setRole("caregiver")}
                  className={`rounded-xl border p-3 text-sm font-bold transition ${
                    role === "caregiver"
                      ? "border-[#087f6a] bg-[#eaf7f3] text-[#087f6a]"
                      : "border-[#dce6e3] bg-white text-[#566c66]"
                  }`}
                >
                  Caregiver
                </button>
              </div>
            </fieldset>

            <div className="rounded-xl bg-[#f5faf8] p-3 text-xs leading-5 text-[#60756f]">
              MediMate supports medication organization and adherence. It
              does not provide diagnosis, prescriptions, or emergency
              medical care.
            </div>

            {message && (
              <div
                className={`rounded-xl p-3 text-sm ${
                  isError
                    ? "bg-red-50 text-red-700"
                    : "bg-[#eaf7f3] text-[#176756]"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#087f6a] py-3.5 font-bold text-white transition hover:bg-[#056452] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#687b76]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#087f6a] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}