"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, type DemoRole } from "@/lib/demo-accounts";
import { safeNextPath } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) {
      errs.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Please enter your password";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const signIn = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true);
    try {
      const user = await api.auth.login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${user.full_name}.`);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(safeNextPath(next));
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "That email and password don't match. Please try again."
          : err instanceof Error
            ? err.message
            : "Sign in failed. Please try again.";
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await signIn(email, password);
  };

  const handleDemoSignIn = (role: DemoRole) => {
    void signIn(DEMO_ACCOUNTS[role], DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--bg-page)] text-[var(--text-page)]">
      {/* Left Form Panel */}
      <div className="w-full lg:w-[48%] flex flex-col justify-between p-6 sm:p-12 lg:p-16 z-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-base font-semibold group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-lg px-1 py-0.5"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D5E] shadow-[0_0_12px_#FF4D5E]" />
            <span>Pulse<span className="text-[#8B93A1]">OS</span></span>
          </Link>
        </div>

        <div className="max-w-[420px] w-full mx-auto my-12">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F4F7]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[#8B93A1]">
              Enter your credentials to access your health companion dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field with Floating Label Style */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                className={`w-full h-12 px-4 rounded-xl bg-[#12161D] text-sm text-[#F2F4F7] border outline-none transition-all ${
                  errors.email
                    ? "border-[#FF4D5E] focus:ring-2 focus:ring-[#FF4D5E]/30"
                    : "border-white/10 hover:border-white/20 focus:border-[#5EE1D2] focus:ring-2 focus:ring-[#5EE1D2]/25"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-[#FF4D5E] flex items-center gap-1 mt-1" role="alert">
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#5EE1D2] hover:underline focus-visible:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={`w-full h-12 px-4 rounded-xl bg-[#12161D] text-sm text-[#F2F4F7] border outline-none transition-all ${
                  errors.password
                    ? "border-[#FF4D5E] focus:ring-2 focus:ring-[#FF4D5E]/30"
                    : "border-white/10 hover:border-white/20 focus:border-[#5EE1D2] focus:ring-2 focus:ring-[#5EE1D2]/25"
                }`}
              />
              {errors.password && (
                <p className="text-xs text-[#FF4D5E] flex items-center gap-1 mt-1" role="alert">
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full h-12 rounded-full font-semibold bg-[#FF4D5E] text-white shadow-lg shadow-[#FF4D5E]/20 hover:scale-[1.01] active:scale-[0.98]"
            >
              Sign in to PulseOS
            </Button>
          </form>

          {/* Demo Quick Access */}
          <div className="mt-6 pt-6 border-t border-white/8 space-y-3">
            <p className="text-xs font-medium text-center text-[#8B93A1]">
              Or explore with a synthetic demo account (requires seeded API):
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoSignIn("patient")}
                className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#F2F4F7] transition-all hover:scale-[1.02]"
              >
                Patient Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn("doctor")}
                className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#F2F4F7] transition-all hover:scale-[1.02]"
              >
                Physician Demo
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-[#8B93A1]">
            Don&rsquo;t have an account yet?{" "}
            <Link href="/register" className="text-[#5EE1D2] font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-[#8B93A1]/70">
          PulseOS explains information and does not provide medical diagnoses.
        </div>
      </div>

      {/* Right Calm Brand Panel (Desktop) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0B0D12] via-[#12161D] to-[#07090D] border-l border-white/8 items-center justify-center p-16 overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(94, 225, 210, 0.08) 0%, rgba(255, 77, 94, 0.04) 50%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-md relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5EE1D2]/10 border border-[#5EE1D2]/25 text-xs font-mono text-[#5EE1D2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2] animate-pulse" />
            Clinical Intelligence Companion
          </div>

          <blockquote className="text-2xl font-medium tracking-tight text-[#F2F4F7] leading-relaxed">
            &ldquo;PulseOS translated my abnormal metabolic panel into three concise questions I brought straight to my doctor. The consultation was calmer and twice as effective.&rdquo;
          </blockquote>

          <div className="space-y-1 pt-2">
            <p className="text-sm font-semibold text-[#F2F4F7]">Elena Rostova</p>
            <p className="text-xs text-[#8B93A1]">Patient using PulseOS for quarterly lab follow-up</p>
          </div>

          <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4 text-xs text-[#8B93A1]">
            <div className="flex items-center gap-2">
              <span className="text-[#5EE1D2]">✓</span> End-to-end encrypted
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#5EE1D2]">✓</span> Synthetic sandbox data
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#5EE1D2]">✓</span> Strict non-diagnostic safety
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#5EE1D2]">✓</span> Instant streaming explainer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
