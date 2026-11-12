"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthLayout, Field } from "@/components/app/auth-layout";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/ui/toast";
import { ApiError, api } from "@/lib/api";

const STRENGTH = [
  { label: "Too short", tone: "bg-line-strong" },
  { label: "Weak", tone: "bg-pulse" },
  { label: "Fair", tone: "bg-amber" },
  { label: "Good", tone: "bg-teal" },
  { label: "Strong", tone: "bg-teal" },
];

function strengthOf(pwd: string): number {
  if (pwd.length < 8) return 0;
  let score = 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  const strength = strengthOf(password);

  const validate = () => {
    const errs: { fullName?: string; email?: string; password?: string } = {};
    if (!fullName.trim()) errs.fullName = "Enter your full name.";
    if (!email) errs.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await api.auth.register(fullName.trim(), email, password);
      toast.success("Account created. Welcome to PulseOS.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 409
          ? "An account with this email already exists. Try signing in."
          : err instanceof Error
            ? err.message
            : "Could not create your account. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const clear = (key: keyof typeof errors) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Turn lab reports and readings into plain language. Free, with sample data."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-teal hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field
          id="reg-name"
          label="Full name"
          autoComplete="name"
          placeholder="Alex Rivera"
          value={fullName}
          error={errors.fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            clear("fullName");
          }}
        />
        <Field
          id="reg-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clear("email");
          }}
        />
        <div>
          <Field
            id="reg-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear("password");
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
          {password && (
            <div className="mt-2.5 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-hover">
                    <motion.span
                      className={`block h-full ${STRENGTH[strength].tone}`}
                      initial={false}
                      animate={{ scaleX: strength >= i ? 1 : 0 }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                    />
                  </span>
                ))}
              </div>
              <span className="w-16 text-right text-xs text-fg-muted">{STRENGTH[strength].label}</span>
            </div>
          )}
        </div>

        <p className="flex gap-2 rounded-control border border-line bg-hover px-3.5 py-3 text-xs leading-relaxed text-fg-muted">
          <Icon name="info" size={15} className="mt-px shrink-0" />
          New accounts are patient accounts. Physician access is set up by the PulseOS team.
        </p>

        <button type="submit" disabled={isLoading} className="btn-primary h-12 w-full">
          {isLoading ? "Creating account…" : "Create free account"}
        </button>
      </form>
    </AuthLayout>
  );
}
