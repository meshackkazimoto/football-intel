"use client";

import { SelectHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string | number;
}

interface FormSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError;
  options: Option[];
}

export function FormSelect({
  label,
  error,
  options,
  className,
  ...props
}: FormSelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-300 mb-2">
          {label}
        </label>
      )}

      <select
        {...props}
        className={cn(
          "w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          className,
        )}
      >
        <option value="">Select option</option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-slate-800"
          >
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-xs text-rose-500 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}