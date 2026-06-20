import { Topbar } from "@/components/layout/Topbar";
import { coupons } from "@/lib/mock-data";
import { cn, shortDate } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

export default function CouponsPage() {
  return (
    <>
      <Topbar
        title="Coupons"
        subtitle={`${coupons.filter((c) => c.status === "active").length} active · ${coupons.length} total`}
      />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Toolbar */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              placeholder="Search by code or description…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>
          {["All", "Active", "Scheduled", "Expired"].map((t, i) => (
            <button
              key={t}
              className={cn(
                "h-9 px-3.5 rounded-full text-[12px] font-display font-bold border",
                i === 0 ? "bg-ink text-white border-ink" : "bg-surface text-ink-soft border-line hover:border-ink/30",
              )}
            >
              {t}
            </button>
          ))}
          <button className="h-10 px-4 rounded-xl bg-primary text-white font-display font-bold text-[13px] inline-flex items-center gap-2 hover:bg-primary-dark">
            <Plus className="h-4 w-4" /> New coupon
          </button>
        </div>

        {/* Grid of coupon cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((c) => {
            const pct = Math.min(100, Math.round((c.redemptions / c.cap) * 100));
            return (
              <div key={c.code} className="card overflow-hidden">
                {/* Ticket header */}
                <div className="p-5 bg-gradient-to-br from-primary to-[#FF8A65] text-white relative">
                  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/12" />
                  <p className="text-[10.5px] uppercase tracking-[0.18em] text-white/65 font-display font-bold">
                    {c.type === "flat" ? "FLAT DISCOUNT" : c.type === "percent" ? "PERCENT OFF" : "FREE DELIVERY"}
                  </p>
                  <p className="font-display font-bold text-[34px] tracking-[-0.02em] mt-1 leading-none">
                    {c.code}
                  </p>
                  <p className="text-white/85 text-[12.5px] mt-2 max-w-[24ch]">
                    {c.description}
                  </p>
                </div>
                {/* Footer meta */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted">Redemptions</span>
                    <span className="font-display font-bold text-ink">
                      {c.redemptions.toLocaleString("en-IN")} / {c.cap.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-cream overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11.5px] text-muted">
                      Ends {shortDate(c.endsAt)}
                    </span>
                    <StatusChip status={c.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: "Active",    cls: "bg-success-soft text-success" },
    scheduled: { label: "Scheduled", cls: "bg-secondary-soft text-secondary" },
    expired:   { label: "Expired",   cls: "bg-cream text-muted" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}
