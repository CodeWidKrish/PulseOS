"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, Field } from "@/components/app/auth-layout";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/ui/toast";
import { ApiError, api } from "@/lib/api";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, type DemoRole } from "@/lib/demo-accounts";
import { safeNextPath } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<"form" | DemoRole | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const signIn = async (loginEmail: string, loginPassword: string, source: "form" | DemoRole) => {
    setPending(source);
    try {
      const user = await api.auth.login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${user.full_name}.`);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(safeNextPath(next));
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 401
          ? "That email and password don’t match. Please try again."
          : err instanceof Error
            ? err.message
            : "Sign in failed. Please try again.",
      );
      setPending(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await signIn(email, password, "form");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your reports, vitals and visits."
      footer={
        <>
          New to PulseOS?{" "}
          <Link href="/register" className="font-medium text-teal hover:underline">
            Create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
        />
        <Field
          id="login-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
          }}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-fg-muted hover:text-fg"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
            </button>
          }
        />
        <button type="submit" disabled={pending !== null} className="btn-primary h-12 w-full">
          {pending === "form" ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-8">
        <div className="flex items-center gap-3 text-xs text-fg-muted">
          <span className="h-px flex-1 bg-line" />
          or try a demo account
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(["patient", "doctor"] as const).map((role) => (
            <button
              key={role}
              type="button"
              disabled={pending !== null}
              onClick={() => void signIn(DEMO_ACCOUNTS[role], DEMO_PASSWORD, role)}
              className="btn-secondary h-11 text-sm"
            >
              <Icon name={role === "patient" ? "user" : "stethoscope"} size={16} />
              {pending === role ? "Opening…" : role === "patient" ? "Patient demo" : "Physician demo"}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-fg-muted">Demo accounts use synthetic data from the API seed.</p>
      </div>
    </AuthLayout>
  );
}
