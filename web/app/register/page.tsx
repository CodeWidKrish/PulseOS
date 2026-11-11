"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const strengthLabels = ["Empty", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-white/10", "bg-[#FF4D5E]", "bg-[#FFB86B]", "bg-[#5EE1D2]", "bg-[#28C840]"];

  const validate = () => {
    const errs: { fullName?: string; email?: string; password?: string } = {};
    if (!fullName.trim()) {
      errs.fullName = "Please enter your full name";
    }

    if (!email) {
      errs.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Please enter a password";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters long";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.auth.register(fullName.trim(), email, password);
      toast.success("Account created successfully! Welcome to PulseOS.");
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 409
          ? "An account with this email already exists. Try signing in."
          : err instanceof Error
            ? err.message
            : "Could not create your account. Please try again.";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--bg-page)] text-[var(--text-page)]">
      {/* Left Form Panel */}
      <div className="w-full lg:w-[48%] flex flex-col justify-between p-6 sm:p-12 lg:p-16 z-10 overflow-y-auto">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-base font-semibold group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-lg px-1 py-0.5"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D5E] shadow-[0_0_12px_#FF4D5E]" />
            <span>Pulse<span className="text-[#8B93A1]">OS</span></span>
          </Link>
        </div>

        <div className="max-w-[420px] w-full mx-auto my-8">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F4F7]">
              Create account
            </h1>
            <p className="mt-2 text-sm text-[#8B93A1]">
              Start turning lab reports and vital metrics into plain language.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-xs text-[#8B93A1] rounded-xl bg-[#12161D] border border-white/10 px-4 py-3">
              New accounts are patient accounts. Physician and admin access is provisioned by
              the PulseOS team.
            </p>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-name"
                className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider"
              >
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Alex Rivera"
                className={`w-full h-11 px-4 rounded-xl bg-[#12161D] text-sm text-[#F2F4F7] border outline-none transition-all ${
                  errors.fullName
                    ? "border-[#FF4D5E] focus:ring-2 focus:ring-[#FF4D5E]/30"
                    : "border-white/10 hover:border-white/20 focus:border-[#5EE1D2] focus:ring-2 focus:ring-[#5EE1D2]/25"
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-[#FF4D5E] flex items-center gap-1 mt-1" role="alert">
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-email"
                className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@example.com"
                className={`w-full h-11 px-4 rounded-xl bg-[#12161D] text-sm text-[#F2F4F7] border outline-none transition-all ${
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

            {/* Password Field with Strength Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reg-password"
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
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Minimum 8 characters"
                className={`w-full h-11 px-4 rounded-xl bg-[#12161D] text-sm text-[#F2F4F7] border outline-none transition-all ${
                  errors.password
                    ? "border-[#FF4D5E] focus:ring-2 focus:ring-[#FF4D5E]/30"
                    : "border-white/10 hover:border-white/20 focus:border-[#5EE1D2] focus:ring-2 focus:ring-[#5EE1D2]/25"
                }`}
              />

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="pt-1.5 space-y-1">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 rounded-full transition-colors ${
                          strengthScore >= step ? strengthColors[strengthScore] : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#8B93A1]">
                    <span>Password strength:</span>
                    <span className="font-medium text-[#F2F4F7]">
                      {strengthLabels[strengthScore]}
                    </span>
                  </div>
                </div>
              )}

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
              className="w-full h-12 mt-2 rounded-full font-semibold bg-[#FF4D5E] text-white shadow-lg shadow-[#FF4D5E]/20 hover:scale-[1.01] active:scale-[0.98]"
            >
              Create Free Account
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[#8B93A1]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#5EE1D2] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-[#8B93A1]/70">
          PulseOS explains information and does not provide medical diagnoses.
        </div>
      </div>

      {/* Right Calm Brand Panel */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0B0D12] via-[#12161D] to-[#07090D] border-l border-white/8 items-center justify-center p-16 overflow-hidden">
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
            Zero-Jargon Promise
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-[#F2F4F7] leading-tight">
            Take full ownership of your health metrics.
          </h2>

          <p className="text-[#8B93A1] text-sm leading-relaxed text-pretty-body">
            Upload your laboratory results, receive structured biomarker breakdowns with reference intervals, and automatically generate focused questions for your doctor.
          </p>

          <div className="p-5 rounded-2xl bg-[#12161D]/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#8B93A1]">SAMPLE METRIC</span>
              <span className="font-mono text-[#5EE1D2] bg-[#5EE1D2]/10 px-2 py-0.5 rounded-full">
                Normal (5.4%)
              </span>
            </div>
            <p className="text-sm font-medium text-[#F2F4F7]">
              &ldquo;Your 3-month average blood sugar is in a healthy range.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
