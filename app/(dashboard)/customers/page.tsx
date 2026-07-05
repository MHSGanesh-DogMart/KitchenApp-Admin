"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { cn, shortDate } from "@/lib/utils";
import { Download, Search, UserPlus2 } from "lucide-react";

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

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/api/admin/users`);
        const data = await res.json();
        if (data.success) setUsers(data.data || []);
      } catch {
        // leave empty on failure
      } finally {
        setLoading(false);
      }
    })();
  }, [apiUrl]);

  const filtered = users.filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  return (
    <>
      <Topbar title="Customers" subtitle={`${users.length} diners on Padosi`} />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Segment summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SegTile label="TOTAL" value={`${users.length}`} hint="All customers" accent="primary" />
          <SegTile label="WITH EMAIL" value={`${users.filter((u) => u.email).length}`} hint="Provided email" accent="secondary" />
          <SegTile label="ACTIVE" value={`${users.filter((u) => (u.status ?? "Active") === "Active").length}`} hint="Not blocked" accent="success" />
          <SegTile label="BLOCKED" value={`${users.filter((u) => u.status === "Blocked").length}`} hint="Suspended" accent="warn" />
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">Loading customers…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No customers yet.</td></tr>
                ) : (
                  filtered.map((u) => (
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
                    </tr>
                  ))
                )}
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
