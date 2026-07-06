"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { cn, inr } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";

type ApiOrder = {
  id: string;
  customer: string;
  phone?: string | null;
  kitchen: string;
  items: number;
  total: number;
  payment: string;       // paymentStatus: PAID | PENDING | FAILED
  fulfillment: string;   // delivery | pickup
  status: string;        // DB status
  createdAt: string;
};

type Stats = { revenue: number; live: number; refunds: number };

// Filter chips → DB status token sent to the API.
const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Cooking", value: "PREPARING" },
  { label: "Out for delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Refunded", value: "REFUNDED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const LIMIT = 20;

export default function OrdersPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.207.75.184";

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>({ revenue: 0, live: 0, refunds: 0 });

  // Reset to page 1 when search or filter changes.
  useEffect(() => {
    setPage(1);
  }, [query, status]);

  // Server-side search + filter + pagination (debounced).
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
        if (query.trim()) params.set("search", query.trim());
        if (status) params.set("status", status);
        const res = await fetch(`${apiUrl}/api/admin/orders?${params.toString()}`, { signal: ctrl.signal });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
          setTotal(data.total ?? 0);
          if (data.stats) setStats(data.stats);
        }
      } catch {
        // keep existing rows on failure / abort
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [apiUrl, query, status, page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <>
      <Topbar title="Orders" subtitle="Live ledger across every kitchen" />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryTile label="REVENUE (VISIBLE)" value={inr(stats.revenue)} />
          <SummaryTile label="LIVE (COOKING + OFD)" value={`${stats.live}`} accent="primary" />
          <SummaryTile label="REFUNDS LAST 24H" value={`${stats.refunds}`} accent="warn" />
        </div>

        {/* Toolbar */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, customer or kitchen…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setStatus(f.value)}
              className={cn(
                "h-9 px-3.5 rounded-full text-[12px] font-display font-bold border",
                status === f.value
                  ? "bg-ink text-white border-ink"
                  : "bg-surface text-ink-soft border-line hover:border-ink/30",
              )}
            >
              {f.label}
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
                  <th className="text-left font-display font-bold px-5 py-3">Kitchen</th>
                  <th className="text-right font-display font-bold px-5 py-3">Items</th>
                  <th className="text-right font-display font-bold px-5 py-3">Total</th>
                  <th className="text-left font-display font-bold px-5 py-3">Payment</th>
                  <th className="text-left font-display font-bold px-5 py-3">Placed</th>
                  <th className="text-left font-display font-bold px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-muted">Loading orders…</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-muted">{query.trim() || status ? "No orders match your filters." : "No orders yet."}</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-t border-line hover:bg-cream/30">
                      <td className="px-5 py-4 font-display font-bold">#{o.id.slice(0, 6).toUpperCase()}</td>
                      <td className="px-5 py-4 text-ink-soft">{o.customer}</td>
                      <td className="px-5 py-4 text-ink-soft">{o.kitchen}</td>
                      <td className="px-5 py-4 text-right">{o.items}</td>
                      <td className="px-5 py-4 text-right font-display font-bold">{inr(o.total)}</td>
                      <td className="px-5 py-4 text-ink-soft">
                        <span className="capitalize">{o.payment.toLowerCase()}</span>
                        <span className="text-[11px] text-muted"> · {o.fulfillment}</span>
                      </td>
                      <td className="px-5 py-4 text-ink-soft text-[12px]">{timeAgo(o.createdAt)}</td>
                      <td className="px-5 py-4"><StatusChip status={o.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-line">
            <p className="text-[12px] text-muted">
              {total === 0
                ? "0 orders"
                : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="h-9 px-3 rounded-lg border border-line font-display font-bold text-[12px] inline-flex items-center gap-1 disabled:opacity-40 hover:border-ink/30"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <span className="text-[12px] text-ink-soft font-display font-bold px-1">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="h-9 px-3 rounded-lg border border-line font-display font-bold text-[12px] inline-flex items-center gap-1 disabled:opacity-40 hover:border-ink/30"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
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
    PENDING_PAYMENT:  { label: "Pending",          cls: "bg-cream text-muted" },
    PLACED:           { label: "Placed",           cls: "bg-secondary-soft text-secondary" },
    ACCEPTED:         { label: "Accepted",         cls: "bg-secondary-soft text-secondary" },
    PREPARING:        { label: "Cooking",          cls: "bg-secondary-soft text-secondary" },
    READY:            { label: "Ready",            cls: "bg-primary-soft text-primary" },
    OUT_FOR_DELIVERY: { label: "Out for delivery", cls: "bg-primary-soft text-primary" },
    DELIVERED:        { label: "Delivered",        cls: "bg-success-soft text-success" },
    CANCELLED:        { label: "Cancelled",        cls: "bg-cream text-muted" },
    PAYMENT_FAILED:   { label: "Payment failed",   cls: "bg-[#FFE0E0] text-red-600" },
    REFUNDED:         { label: "Refunded",         cls: "bg-[#FFF3D6] text-warn" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
