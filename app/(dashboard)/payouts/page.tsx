import { Topbar } from "@/components/layout/Topbar";
import { payouts } from "@/lib/mock-data";
import { cn, inr, shortDate } from "@/lib/utils";
import { Download, PlayCircle, Search } from "lucide-react";

export default function PayoutsPage() {
  const paid = payouts.filter((p) => p.status === "paid").reduce((a, b) => a + b.net, 0);
  const pending = payouts.filter((p) => p.status === "pending").reduce((a, b) => a + b.net, 0);
  const failed = payouts.filter((p) => p.status === "failed").reduce((a, b) => a + b.net, 0);

  return (
    <>
      <Topbar title="Payouts" subtitle="Cook earnings & payment cycles" />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Summary tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SumTile label="PAID OUT (30D)" value={inr(paid)} hint={`${payouts.filter((p) => p.status === "paid").length} payouts`} accent="success" />
          <SumTile label="PENDING" value={inr(pending)} hint="Awaiting cycle close" accent="primary" />
          <SumTile label="FAILED" value={inr(failed)} hint="Retry required" accent="warn" />
        </div>

        {/* Toolbar */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              placeholder="Search by cook, cycle or payout ID…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>
          {["All", "Paid", "Pending", "Failed"].map((t, i) => (
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
          <button className="h-10 px-4 rounded-xl bg-surface border border-line font-display font-bold text-[12.5px] inline-flex items-center gap-2 hover:border-ink/30">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="h-10 px-4 rounded-xl bg-primary text-white font-display font-bold text-[13px] inline-flex items-center gap-2 hover:bg-primary-dark">
            <PlayCircle className="h-4 w-4" /> Run cycle
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-cream/60 text-ink-soft text-[11px] uppercase tracking-[0.12em]">
                <tr>
                  <th className="text-left font-display font-bold px-5 py-3">Payout</th>
                  <th className="text-left font-display font-bold px-5 py-3">Cook</th>
                  <th className="text-left font-display font-bold px-5 py-3">Cycle</th>
                  <th className="text-right font-display font-bold px-5 py-3">Orders</th>
                  <th className="text-right font-display font-bold px-5 py-3">Gross</th>
                  <th className="text-right font-display font-bold px-5 py-3">Commission</th>
                  <th className="text-right font-display font-bold px-5 py-3">Net</th>
                  <th className="text-left font-display font-bold px-5 py-3">Paid at</th>
                  <th className="text-left font-display font-bold px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-line hover:bg-cream/30">
                    <td className="px-5 py-4 font-mono text-[11.5px] text-ink-soft">{p.id}</td>
                    <td className="px-5 py-4 font-display font-bold text-ink">{p.cook}</td>
                    <td className="px-5 py-4 text-ink-soft">{p.cycle}</td>
                    <td className="px-5 py-4 text-right">{p.orders}</td>
                    <td className="px-5 py-4 text-right text-ink-soft">{inr(p.gross)}</td>
                    <td className="px-5 py-4 text-right text-muted">−{inr(p.commission)}</td>
                    <td className="px-5 py-4 text-right font-display font-bold text-success">{inr(p.net)}</td>
                    <td className="px-5 py-4 text-ink-soft text-[12px]">{p.paidAt ? shortDate(p.paidAt) : "—"}</td>
                    <td className="px-5 py-4"><StatusChip status={p.status} /></td>
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

function SumTile({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: "success" | "primary" | "warn" }) {
  const accentCls = { success: "text-success", primary: "text-primary", warn: "text-warn" }[accent];
  return (
    <div className="card-padded">
      <p className="kicker">{label}</p>
      <p className={cn("mt-2 font-display font-bold text-[28px] tracking-[-0.02em] leading-none", accentCls)}>{value}</p>
      <p className="text-[11.5px] text-muted mt-1.5">{hint}</p>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid:    { label: "Paid",    cls: "bg-success-soft text-success" },
    pending: { label: "Pending", cls: "bg-primary-soft text-primary" },
    failed:  { label: "Failed",  cls: "bg-[#FFE3E3] text-error" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}
