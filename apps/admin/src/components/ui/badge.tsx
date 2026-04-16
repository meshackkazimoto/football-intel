"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[color:var(--foreground)] text-[color:var(--background)]",
        secondary:
          "border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--foreground)]",
        outline: "border-[color:var(--border)] text-[color:var(--foreground)]",
        success:
          "border-transparent bg-[color:var(--success-soft)] text-[color:var(--success)]",
        warning:
          "border-transparent bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
        destructive:
          "border-transparent bg-[color:var(--destructive-soft)] text-[color:var(--destructive)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
