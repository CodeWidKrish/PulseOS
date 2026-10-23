import React, { forwardRef, useId } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  unit?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      unit,
      leftIcon,
      id,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#8B93A1] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={`w-full h-11 px-3.5 rounded-xl bg-[#12161D] text-[#F2F4F7] text-sm placeholder:text-[#8B93A1]/50 border transition-all duration-200 outline-none
              ${leftIcon ? "pl-10" : ""}
              ${unit ? "pr-14" : ""}
              ${
                hasError
                  ? "border-[#FF4D5E] focus:ring-2 focus:ring-[#FF4D5E]/30 focus:border-[#FF4D5E]"
                  : "border-white/10 hover:border-white/20 focus:border-[#5EE1D2] focus:ring-2 focus:ring-[#5EE1D2]/25"
              }
              ${
                disabled
                  ? "opacity-40 cursor-not-allowed bg-white/5"
                  : "focus:bg-[#151a22]"
              }
              ${className}`}
            {...props}
          />

          {unit && (
            <span className="absolute right-3.5 text-xs font-mono text-[#8B93A1] pointer-events-none select-none">
              {unit}
            </span>
          )}
        </div>

        {hasError && (
          <p id={errorId} className="text-xs text-[#FF4D5E] flex items-center gap-1 mt-0.5" role="alert">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {!hasError && helperText && (
          <p id={helperId} className="text-xs text-[#8B93A1]/80 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
