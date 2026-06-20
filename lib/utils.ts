import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditional class names with Tailwind-aware de-duping.
 * Use everywhere instead of template-string class joins.
 *
 *   cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an INR amount with a leading ₹ — no decimals by default. */
export function inr(n: number, opts: { decimals?: number } = {}) {
  const { decimals = 0 } = opts;
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** "12 May 2026" style — short, locale-tolerant. */
export function shortDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
