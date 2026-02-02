"use client";

import { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="text-slate-400 text-sm mt-1">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}