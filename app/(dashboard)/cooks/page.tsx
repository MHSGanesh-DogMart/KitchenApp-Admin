import { Topbar } from "@/components/layout/Topbar";
import { cn, inr } from "@/lib/utils";
import { cooks } from "@/lib/mock-data";
import { Plus, Search } from "lucide-react";

export default function CooksPage() {
  return (
    <>
      <Topbar
        title="Cooks"
        subtitle={`${cooks.length} kitchens · ${cooks.filter((c) => c.status === "active").length} active`}
      />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Toolbar */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              placeholder="Search by kitchen name, FSSAI, phone…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>
          {["All", "Active", "Pending", "Suspended"].map((t, i) => (
            <button
              key={t}
              className={cn(
                "h-9 px-3.5 rounded-full text-[12px] font-display font-bold border",
                i === 0
                  ? "bg-ink text-white border-ink"
                  : "bg-surface text-ink-soft border-line hover:border-ink/30",
              )}
            >
              {t}
            </button>
          ))}
          <button className="ml-auto h-10 px-4 rounded-xl bg-primary text-white font-display font-bold text-[13px] inline-flex items-center gap-2 hover:bg-primary-dark">
            <Plus className="h-4 w-4" /> Invite cook
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-cream/60 text-ink-soft text-[11px] uppercase tracking-[0.12em]">
                <tr>
                  <th className="text-left font-display font-bold px-5 py-3">Kitchen</th>
                  <th className="text-left font-display font-bold px-5 py-3">Tier</th>
                  <th className="text-left font-display font-bold px-5 py-3">FSSAI</th>
                  <th className="text-left font-display font-bold px-5 py-3">City</th>
                  <th className="text-right font-display font-bold px-5 py-3">30d orders</th>
                  <th className="text-right font-display font-bold px-5 py-3">30d earnings</th>
                  <th className="text-left font-display font-bold px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {cooks.map((c) => (
                  <tr key={c.id} className="border-t border-line hover:bg-cream/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary text-white grid place-items-center text-[11px] font-display font-bold">
                          {initials(c.name)}
                        </div>
                        <div>
                          <p className="font-display font-bold text-ink">{c.name}</p>
                          <p className="text-[11px] text-muted">★ {c.rating.toFixed(1)} · {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("chip", c.tier === 1 ? "bg-cream text-ink-soft" : "bg-secondary-soft text-secondary")}>
                        Tier {c.tier}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-soft font-mono text-[12px]">{c.fssai}</td>
                    <td className="px-5 py-4 text-ink-soft">{c.city}</td>
                    <td className="px-5 py-4 text-right">{c.orders30d}</td>
                    <td className="px-5 py-4 text-right font-display font-bold">{inr(c.earnings30d)}</td>
                    <td className="px-5 py-4"><StatusChip status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-success-soft text-success" },
    pending_verification: { label: "Pending", cls: "bg-primary-soft text-primary" },
    suspended: { label: "Suspended", cls: "bg-cream text-muted" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}
