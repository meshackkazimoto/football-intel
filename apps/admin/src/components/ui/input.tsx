"use client";

import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
}

export function FormInput({
  label,
  error,
  className,
  ...props
}: FormInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-300 mb-2">
          {label}
        </label>
      )}

      <input
        {...props}
        className={cn(
          "w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          className,
        )}
      />

      {error && (
        <p className="text-xs text-rose-500 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}