import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  tint?: "primary" | "secondary" | "success" | "warn";
  className?: string;
};

const tintClasses = {
  primary: { bg: "bg-primary-soft", fg: "text-primary" },
  secondary: { bg: "bg-secondary-soft", fg: "text-secondary" },
  success: { bg: "bg-success-soft", fg: "text-success" },
  warn: { bg: "bg-[#FFF3D6]", fg: "text-warn" },
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  tint = "primary",
  className,
}: Props) {
  const t = tintClasses[tint];
  return (
    <div className={cn("card-padded", className)}>
      <div className="flex items-start justify-between">
        <div className={cn("h-11 w-11 rounded-xl grid place-items-center", t.bg)}>
          <Icon className={cn("h-5 w-5", t.fg)} strokeWidth={2.4} />
        </div>
        {delta && (
          <span
            className={cn(
              "chip",
              delta.positive
                ? "bg-success-soft text-success"
                : "bg-primary-soft text-primary",
            )}
          >
            {delta.value}
          </span>
        )}
      </div>
      <p className="kicker mt-4">{label}</p>
      <p className="mt-1 font-display font-bold text-[28px] tracking-[-0.02em] leading-none text-ink">
        {value}
      </p>
    </div>
  );
}
