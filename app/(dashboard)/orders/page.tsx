import { Topbar } from "@/components/layout/Topbar";
import { recentOrders } from "@/lib/mock-data";
import { cn, inr } from "@/lib/utils";
import { Download, Search } from "lucide-react";

export default function OrdersPage() {
  const totals = {
    revenue: recentOrders.reduce((a, b) => a + (b.status === "cancelled" || b.status === "refunded" ? 0 : b.total), 0),
    refunds: recentOrders.filter((o) => o.status === "refunded").length,
    pending: recentOrders.filter((o) => o.status === "cooking" || o.status === "out_for_delivery").length,
  };

  return (
    <>
      <Topbar
        title="Orders"
        subtitle="Live ledger across every kitchen"
      />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryTile label="REVENUE (VISIBLE)" value={inr(totals.revenue)} />
          <SummaryTile label="LIVE (COOKING + OFD)" value={`${totals.pending}`} accent="primary" />
          <SummaryTile label="REFUNDS LAST 24H" value={`${totals.refunds}`} accent="warn" />
        </div>

        {/* Toolbar */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              placeholder="Search by ID, customer or cook…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>
          {["All", "Cooking", "Out for delivery", "Delivered", "Refunded", "Cancelled"].map((t, i) => (
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
          <button className="ml-auto h-10 px-4 rounded-xl bg-surface border border-line font-display font-bold text-[12.5px] inline-flex items-center gap-2 hover:border-ink/30">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-cream/60 text-ink-soft text-[11px] uppercase tracking-[0.12em]">
                <tr>
                  <th className="text-left font-display font-bold px-5 py-3">Order</th>
                  <th className="text-left font-display font-bold px-5 py-3">Customer</th>
                  <th className="text-left font-display font-bold px-5 py-3">Cook</th>
                  <th className="text-right font-display font-bold px-5 py-3">Items</th>
                  <th className="text-right font-display font-bold px-5 py-3">Total</th>
                  <th className="text-left font-display font-bold px-5 py-3">Payment</th>
                  <th className="text-left font-display font-bold px-5 py-3">Placed</th>
                  <th className="text-left font-display font-bold px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-line hover:bg-cream/30">
                    <td className="px-5 py-4 font-display font-bold">{o.id}</td>
                    <td className="px-5 py-4 text-ink-soft">{o.customer}</td>
                    <td className="px-5 py-4 text-ink-soft">{o.cook}</td>
                    <td className="px-5 py-4 text-right">{o.items}</td>
                    <td className="px-5 py-4 text-right font-display font-bold">{inr(o.total)}</td>
                    <td className="px-5 py-4 text-ink-soft">{o.payment}</td>
                    <td className="px-5 py-4 text-ink-soft text-[12px]">{timeAgo(o.placedAt)}</td>
                    <td className="px-5 py-4"><StatusChip status={o.status} /></td>
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

function SummaryTile({ label, value, accent }: { label: string; value: string; accent?: "primary" | "warn" }) {
  return (
    <div className="card-padded">
      <p className="kicker">{label}</p>
      <p className={cn(
        "mt-2 font-display font-bold text-[24px] tracking-[-0.02em] leading-none",
        accent === "primary" && "text-primary",
        accent === "warn" && "text-warn",
        !accent && "text-ink",
      )}>{value}</p>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    delivered:         { label: "Delivered",        cls: "bg-success-soft text-success" },
    cooking:           { label: "Cooking",          cls: "bg-secondary-soft text-secondary" },
    out_for_delivery:  { label: "Out for delivery", cls: "bg-primary-soft text-primary" },
    cancelled:         { label: "Cancelled",        cls: "bg-cream text-muted" },
    refunded:          { label: "Refunded",         cls: "bg-[#FFF3D6] text-warn" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}

function timeAgo(d: Date) {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
