import React from "react";
import { Icon, type IconName } from "@/components/ui/icon";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: "neutral" | "error";
}

/** Calm, consistent empty / error state with an orbiting halo around the icon. */
export function EmptyState({ icon, title, description, action, tone = "neutral" }: EmptyStateProps) {
  const isError = tone === "error";
  return (
    <div
      className="tile flex flex-col items-center px-6 py-14 text-center"
      role={isError ? "alert" : undefined}
    >
      <div className="relative mb-6 grid h-16 w-16 place-items-center">
        <span
          className={`absolute inset-0 rounded-full border ${isError ? "border-pulse/30" : "border-line-strong"}`}
          aria-hidden="true"
        />
        <span
          className={`absolute -inset-3 rounded-full border border-dashed ${
            isError ? "border-pulse/15" : "border-line"
          } motion-safe:animate-[spin_24s_linear_infinite]`}
          aria-hidden="true"
        />
        <span className={isError ? "text-pulse" : "text-teal"}>
          <Icon name={icon} size={24} />
        </span>
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-fg">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
