"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function PrimaryButton({
  className,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all",
        className,
      )}
    >
      {children}
    </button>
  );
}