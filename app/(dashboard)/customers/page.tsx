"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { cn, shortDate } from "@/lib/utils";
import { Ban, ChevronLeft, ChevronRight, Download, Search, ShieldCheck, UserPlus2 } from "lucide-react";

type ApiUser = {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  dob?: string | null;
  profilePicUrl?: string | null;
  status?: string | null;
  createdAt: string;
};

export default function CustomersPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://13.207.75.184";

  const LIMIT = 20;
  type Stats = { total: number; withEmail: number; active: number; blocked: number };

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, withEmail: 0, active: 0, blocked: 0 });
  const [busyId, setBusyId] = useState<string | null>(null);

  // Reset to page 1 whenever the search term changes.
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Server-side search + pagination (debounced). No local filtering.
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
        if (query.trim()) params.set("search", query.trim());
        const res = await fetch(`${apiUrl}/api/admin/users?${params.toString()}`, { signal: ctrl.signal });
        const data = await res.json();
        if (data.success) {
          const rows: ApiUser[] = data.data || [];
          setUsers(rows);
          setTotal(data.total ?? rows.length);
          // Prefer server stats; fall back to deriving from returned rows so the
          // tiles aren't blank when the backend hasn't sent `stats` yet.
          setStats(
            data.stats ?? {
              total: rows.length,
              withEmail: rows.filter((u) => u.email).length,
              active: rows.filter((u) => (u.status ?? "Active") !== "Blocked").length,
              blocked: rows.filter((u) => u.status === "Blocked").length,
            }
          );
        }
      } catch {
        // leave existing rows on failure / abort
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [apiUrl, query, page]);

  const toggleStatus = async (u: ApiUser) => {
    const next = (u.status ?? "Active") === "Blocked" ? "Active" : "Blocked";
    setBusyId(u.id);
    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${u.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update status");
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: next } : x)));
      // keep the summary tiles in sync
      setStats((s) =>
        next === "Blocked"
          ? { ...s, active: s.active - 1, blocked: s.blocked + 1 }
          : { ...s, active: s.active + 1, blocked: s.blocked - 1 }
      );
    } catch {
      // no-op; row stays unchanged on failure
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <>
      <Topbar title="Customers" subtitle={`${stats.total} diners on Padosi`} />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Segment summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SegTile label="TOTAL" value={`${stats.total}`} hint="All customers" accent="primary" />
          <SegTile label="WITH EMAIL" value={`${stats.withEmail}`} hint="Provided email" accent="secondary" />
          <SegTile label="ACTIVE" value={`${stats.active}`} hint="Not blocked" accent="success" />
          <SegTile label="BLOCKED" value={`${stats.blocked}`} hint="Suspended" accent="warn" />
        </div>

        {/* Toolbar */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone or email…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>
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
                  <th className="text-left font-display font-bold px-5 py-3">Birthday</th>
                  <th className="text-left font-display font-bold px-5 py-3">Joined</th>
                  <th className="text-left font-display font-bold px-5 py-3">Status</th>
                  <th className="text-right font-display font-bold px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">Loading customers…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">{query.trim() ? "No customers match your search." : "No customers yet."}</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-t border-line hover:bg-cream/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {u.profilePicUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.profilePicUrl} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-secondary text-white grid place-items-center text-[11px] font-display font-bold">
                              {initials(u.name)}
                            </div>
                          )}
                          <div>
                            <p className="font-display font-bold text-ink">{u.name}</p>
                            <p className="text-[11px] text-muted">{u.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-ink-soft font-mono text-[12px]">{u.phone}</td>
                      <td className="px-5 py-4 text-ink-soft text-[12px]">{u.dob || "—"}</td>
                      <td className="px-5 py-4 text-ink-soft text-[12px]">{shortDate(new Date(u.createdAt))}</td>
                      <td className="px-5 py-4"><StatusChip status={u.status ?? "Active"} /></td>
                      <td className="px-5 py-4 text-right">
                        {(u.status ?? "Active") === "Blocked" ? (
                          <button
                            onClick={() => toggleStatus(u)}
                            disabled={busyId === u.id}
                            className="h-9 px-3 rounded-lg bg-success-soft text-success font-display font-bold text-[12px] inline-flex items-center gap-1.5 hover:brightness-95 disabled:opacity-50"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> {busyId === u.id ? "…" : "Unblock"}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatus(u)}
                            disabled={busyId === u.id}
                            className="h-9 px-3 rounded-lg bg-[#FFF3D6] text-warn font-display font-bold text-[12px] inline-flex items-center gap-1.5 hover:brightness-95 disabled:opacity-50"
                          >
                            <Ban className="h-3.5 w-3.5" /> {busyId === u.id ? "…" : "Block"}
                          </button>
                        )}
                      </td>
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
                ? "0 results"
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

function SegTile({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: "primary" | "secondary" | "success" | "warn" }) {
  const accentCls = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    warn: "text-warn",
  }[accent];
  return (
    <div className="card-padded">
      <p className="kicker">{label}</p>
      <p className={cn("mt-2 font-display font-bold text-[28px] tracking-[-0.02em] leading-none", accentCls)}>{value}</p>
      <p className="text-[11.5px] text-muted mt-1.5">{hint}</p>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const cls = status === "Blocked" ? "bg-[#FFF3D6] text-warn" : "bg-success-soft text-success";
  return <span className={cn("chip", cls)}>{status}</span>;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}
