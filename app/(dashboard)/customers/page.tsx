import { Topbar } from "@/components/layout/Topbar";
import { customers } from "@/lib/mock-data";
import { cn, inr, shortDate } from "@/lib/utils";
import { Download, Search, UserPlus2 } from "lucide-react";

export default function CustomersPage() {
  return (
    <>
      <Topbar
        title="Customers"
        subtitle={`${customers.length} diners on Padosi`}
      />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Segment summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SegTile label="CHAMPIONS" value={`${customers.filter((c) => c.segment === "champion").length}`} hint="Top 10% LTV" accent="primary" />
          <SegTile label="LOYAL"     value={`${customers.filter((c) => c.segment === "loyal").length}`}     hint="5+ orders" accent="secondary" />
          <SegTile label="NEW"       value={`${customers.filter((c) => c.segment === "new").length}`}       hint="Last 30 days" accent="success" />
          <SegTile label="AT RISK"   value={`${customers.filter((c) => c.segment === "at_risk").length}`}   hint="No order in 60d" accent="warn" />
        </div>

        {/* Toolbar */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              placeholder="Search by name, phone or email…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>
          {["All", "Champions", "Loyal", "New", "At risk"].map((t, i) => (
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
          <button className="ml-auto h-10 px-4 rounded-xl bg-surface border border-line font-display font-bold text-[12.5px] inline-flex items-center gap-2 hover:border-ink/30">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="h-10 px-4 rounded-xl bg-primary text-white font-display font-bold text-[13px] inline-flex items-center gap-2 hover:bg-primary-dark">
            <UserPlus2 className="h-4 w-4" /> Invite
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-cream/60 text-ink-soft text-[11px] uppercase tracking-[0.12em]">
                <tr>
                  <th className="text-left font-display font-bold px-5 py-3">Customer</th>
                  <th className="text-left font-display font-bold px-5 py-3">Phone</th>
                  <th className="text-left font-display font-bold px-5 py-3">City</th>
                  <th className="text-right font-display font-bold px-5 py-3">Orders</th>
                  <th className="text-right font-display font-bold px-5 py-3">Spend</th>
                  <th className="text-left font-display font-bold px-5 py-3">Joined</th>
                  <th className="text-left font-display font-bold px-5 py-3">Segment</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-line hover:bg-cream/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary text-white grid place-items-center text-[11px] font-display font-bold">
                          {initials(c.name)}
                        </div>
                        <div>
                          <p className="font-display font-bold text-ink">{c.name}</p>
                          <p className="text-[11px] text-muted">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-soft font-mono text-[12px]">{c.phone}</td>
                    <td className="px-5 py-4 text-ink-soft">{c.city}</td>
                    <td className="px-5 py-4 text-right">{c.lifetimeOrders}</td>
                    <td className="px-5 py-4 text-right font-display font-bold">{inr(c.lifetimeSpend)}</td>
                    <td className="px-5 py-4 text-ink-soft text-[12px]">{shortDate(c.joinedAt)}</td>
                    <td className="px-5 py-4"><SegmentChip seg={c.segment} /></td>
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

function SegTile({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: "primary" | "secondary" | "success" | "warn" }) {
  const accentCls = {
    primary:   "text-primary",
    secondary: "text-secondary",
    success:   "text-success",
    warn:      "text-warn",
  }[accent];
  return (
    <div className="card-padded">
      <p className="kicker">{label}</p>
      <p className={cn("mt-2 font-display font-bold text-[28px] tracking-[-0.02em] leading-none", accentCls)}>{value}</p>
      <p className="text-[11.5px] text-muted mt-1.5">{hint}</p>
    </div>
  );
}

function SegmentChip({ seg }: { seg: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    champion: { label: "Champion", cls: "bg-primary-soft text-primary" },
    loyal:    { label: "Loyal",    cls: "bg-secondary-soft text-secondary" },
    new:      { label: "New",      cls: "bg-success-soft text-success" },
    at_risk:  { label: "At risk",  cls: "bg-[#FFF3D6] text-warn" },
  };
  const s = map[seg] ?? { label: seg, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}
