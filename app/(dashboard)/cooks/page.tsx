"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { cn, inr } from "@/lib/utils";
import { Search, Plus, AlertTriangle, FileText, Calendar, X, Check, Navigation, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Cook {
  id: string;
  userId: string;
  name: string;
  phone: string;
  tier: number;
  status: 'NEW' | 'AWAITING_FSSAI_FILING' | 'PENDING_DOCS_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'Fssai_Awaiting' | 'Fssai_Approved' | 'Kitchen_Pending' | 'Kitchen_Approved' | 'Kitchen_Rejected';
  dob?: string;
  whatsapp?: string;
  altContact?: string;
  aadhaarNo?: string;
  panNo?: string;
  isVegOnly: boolean;
  hasExistingFssai: boolean;
  fssaiNumber?: string;
  fssaiExpiry?: string;
  city?: string;
  rating?: number;
  orders30d?: number;
  earnings30d?: number;
  appliedAt: string;
}

export default function CooksPage() {
  const [cooks, setCooks] = useState<Cook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Area Filters & Pagination State
  const [cities, setCities] = useState<string[]>([]);
  const [activeCity, setActiveCity] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCooks, setTotalCooks] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCook, setSelectedCook] = useState<Cook | null>(null);
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [fssaiExpiry, setFssaiExpiry] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://koala-wok-extruding.ngrok-free.dev";

  // Fetch active cities list for Area drop-down filter
  const fetchCities = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/config`);
      const data = await res.json();
      if (res.ok && data.success && data.data.activeCities) {
        setCities(data.data.activeCities.map((c: any) => c.name));
      }
    } catch (err) {
      console.error("Failed to load cities config", err);
    }
  };

  // Fetch paginated, searched and filtered cooks
  const fetchCooks = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${apiUrl}/api/admin/cooks?status=${activeTab.toLowerCase()}&page=${page}&limit=5`;
      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      if (activeCity && activeCity !== "All") {
        url += `&city=${encodeURIComponent(activeCity)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch cooks");
      }
      
      setCooks(data.data);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCooks(data.pagination.total || 0);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchCooks();
  }, [activeTab, searchQuery, activeCity, page]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, activeCity]);

  const handleDeleteCook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this kitchen profile?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/cooks/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete cook profile.");
      }
      alert("Kitchen profile deleted successfully!");
      fetchCooks();
    } catch (err: any) {
      alert(err.message || "Failed to delete cook.");
    }
  };

  const handleOpenModal = (cook: Cook) => {
    setSelectedCook(cook);
    setFssaiNumber(cook.fssaiNumber || "");
    setFssaiExpiry(cook.fssaiExpiry || "");
    setModalError("");
    setModalSuccess("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCook(null);
    setFssaiNumber("");
    setFssaiExpiry("");
  };

  const handleFssaiUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCook) return;
    if (!fssaiNumber.trim() || !fssaiExpiry.trim()) {
      setModalError("Please enter both FSSAI License Number and Expiry Date.");
      return;
    }
    if (fssaiNumber.trim().length !== 14) {
      setModalError("FSSAI License Number must be exactly 14 digits.");
      return;
    }
    setModalSubmitting(true);
    setModalError("");
    try {
      const res = await fetch(`${apiUrl}/api/admin/cooks/${selectedCook.id}/fssai-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fssaiNumber, fssaiExpiry }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update FSSAI License");
      }
      setModalSuccess("FSSAI License updated successfully!");
      // Refresh local list state
      fetchCooks();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (err: any) {
      setModalError(err.message || "An error occurred while updating FSSAI");
    } finally {
      setModalSubmitting(false);
    }
  };

  const initials = (name: string) => {
    return name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  };

  return (
    <>
      <Topbar
        title="Cooks"
        subtitle={`${totalCooks} kitchens registered · ${cooks.filter((c) => c.status === "ACTIVE").length} active on this page`}
      />

      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Toolbar with Search, Status Tabs, City Filter, and Invite */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by kitchen name, FSSAI, phone…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>

          <div className="flex gap-2">
            {["All", "Active", "Pending", "Suspended"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "h-9 px-3.5 rounded-full text-[12px] font-display font-bold border transition-all cursor-pointer",
                  activeTab === t
                    ? "bg-ink text-white border-ink"
                    : "bg-surface text-ink-soft border-line hover:border-ink/30",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Area / City Selector */}
          <div className="flex items-center gap-2 h-10 px-3.5 bg-surface border border-line rounded-xl min-w-[170px]">
            <span className="text-[11px] font-display font-bold text-muted uppercase tracking-wider">Area:</span>
            <select
              value={activeCity}
              onChange={(e) => setActiveCity(e.target.value)}
              className="bg-transparent text-[13px] font-display font-bold text-ink outline-none cursor-pointer flex-1"
            >
              <option value="All">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-surface border border-line rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-cream text-ink shadow-sm"
                  : "text-muted hover:text-ink-soft"
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-cream text-ink shadow-sm"
                  : "text-muted hover:text-ink-soft"
              )}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button className="ml-auto h-10 px-4 rounded-xl bg-primary text-white font-display font-bold text-[13px] inline-flex items-center gap-2 hover:bg-primary-dark transition-all">
            <Plus className="h-4 w-4" /> Invite cook
          </button>
        </div>

        {/* Highlight Banner for Awaiting FSSAI Filing */}
        {cooks.some(c => c.status === 'AWAITING_FSSAI_FILING') && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary grid place-items-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-[14px] text-ink">Action Required: FSSAI Registrations Pending</h4>
              <p className="text-[12.5px] text-ink-soft mt-0.5 leading-relaxed">
                Some home chefs have requested assistance applying for basic FSSAI licenses. Select **&quot;File FSSAI&quot;** on these chefs to record their filed license details and activate their kitchens.
              </p>
            </div>
          </div>
        )}

        {/* Content State */}
        {loading ? (
          <div className="card-padded flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-ink-soft font-display">Fetching cooks data...</p>
          </div>
        ) : error ? (
          <div className="card-padded flex flex-col items-center justify-center py-16 space-y-4 border-red-500/20 bg-red-500/5">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm font-display text-error font-bold">{error}</p>
            <Button size="sm" variant="ghost" onClick={fetchCooks}>Retry loading</Button>
          </div>
        ) : cooks.length === 0 ? (
          <div className="card-padded flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="text-3xl">🍳</div>
            <h4 className="font-display font-bold text-[15px]">No kitchens found</h4>
            <p className="text-xs text-muted max-w-xs font-display">We couldn&apos;t find any cooks matching your current tab, search, or area filters.</p>
          </div>
        ) : (
          /* Grid vs. Table View Layout */
          <div className="space-y-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cooks.map((c) => {
                  const isAwaitingFssai = c.status === 'AWAITING_FSSAI_FILING' || c.status === 'Fssai_Awaiting';
                  const isActive = c.status === 'ACTIVE' || c.status === 'Kitchen_Approved';

                  const orders30d = c.orders30d ?? 0;
                  const earnings30d = c.earnings30d ?? 0;
                  const rating = c.rating ?? 4.8;

                  return (
                    <div
                      key={c.id}
                      className="card-padded bg-surface border border-line hover:border-ink/20 hover:shadow-card transition-all relative overflow-hidden flex flex-col justify-between"
                    >
                      {isAwaitingFssai && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      
                      {/* Header: Avatar, Name, Rating */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <Link href={`/cooks/${c.id}`} className="h-11 w-11 rounded-2xl bg-primary text-white grid place-items-center text-[12px] font-display font-bold shrink-0 shadow-sm hover:opacity-90 transition-opacity">
                            {initials(c.name)}
                          </Link>
                          <div className="min-w-0">
                            <Link href={`/cooks/${c.id}`} className="font-display font-bold text-ink text-[14.5px] leading-tight hover:text-primary transition-colors block truncate">
                              {c.name}
                            </Link>
                            <p className="text-[11.5px] text-muted truncate mt-1">{c.phone}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/10 text-amber-600">
                            ★ {rating.toFixed(1)}
                          </span>
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-display font-bold border",
                            c.tier === 1 
                              ? "bg-bg text-ink border-line" 
                              : "bg-secondary-soft text-secondary border-secondary/15"
                          )}>
                            Tier {c.tier}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-line my-4" />

                      {/* Middle: FSSAI, City, Status */}
                      <div className="grid grid-cols-3 gap-2 text-[12px] mb-4">
                        <div>
                          <p className="text-muted font-display font-bold text-[9.5px] uppercase tracking-wider">FSSAI Status</p>
                          <p className="font-mono text-ink-soft font-bold mt-0.5 truncate">
                            {c.fssaiNumber ? (
                              c.fssaiNumber
                            ) : isAwaitingFssai ? (
                              <span className="text-primary font-display font-bold text-[10.5px] uppercase tracking-wide">
                                ⚠️ Awaiting
                              </span>
                            ) : (
                              <span className="text-muted font-normal font-sans">—</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted font-display font-bold text-[9.5px] uppercase tracking-wider">City Area</p>
                          <p className="font-display font-bold text-ink-soft mt-0.5 truncate">{c.city || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-muted font-display font-bold text-[9.5px] uppercase tracking-wider">Status</p>
                          <div className="mt-0.5">
                            <StatusChip status={c.status} />
                          </div>
                        </div>
                      </div>

                      {/* Stats Metrics (30d orders & earnings) */}
                      <div className="grid grid-cols-2 gap-2 p-3 bg-cream/15 rounded-2xl border border-line/50 mb-4">
                        <div className="text-center">
                          <p className="text-muted text-[10px] font-display font-bold uppercase tracking-wider">30d Orders</p>
                          <p className="font-mono font-bold text-ink text-[14px] mt-0.5">{orders30d}</p>
                        </div>
                        <div className="text-center border-l border-line/60">
                          <p className="text-muted text-[10px] font-display font-bold uppercase tracking-wider">30d Earnings</p>
                          <p className="font-mono font-bold text-primary text-[14px] mt-0.5">{inr(earnings30d)}</p>
                        </div>
                      </div>

                      {/* Footer: Action Buttons */}
                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-line/60">
                        {(c.status === 'PENDING_DOCS_APPROVAL' || c.status === 'Kitchen_Pending' || c.status === 'Fssai_Approved') && (
                          <Link
                            href={`/cooks/${c.id}`}
                            className="flex-1 h-9 rounded-xl bg-ink text-white text-[11.5px] font-display font-bold inline-flex items-center justify-center gap-1 hover:opacity-90 transition-all cursor-pointer shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Verify
                          </Link>
                        )}
                        <button
                          onClick={() => handleOpenModal(c)}
                          className={cn(
                            "flex-1 h-9 rounded-xl border text-[11.5px] font-display font-bold inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm",
                            isAwaitingFssai
                              ? "bg-primary text-white border-primary hover:opacity-90"
                              : "bg-white text-ink-soft border-line hover:bg-cream/45 hover:border-ink/20"
                          )}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {isAwaitingFssai ? "File FSSAI" : "Update FSSAI"}
                        </button>
                        <button
                          onClick={() => handleDeleteCook(c.id)}
                          className="h-9 px-3 rounded-xl border bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 text-[11.5px] font-display font-bold inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <X className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead className="bg-cream/60 text-ink-soft text-[11px] uppercase tracking-[0.12em]">
                      <tr>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[220px]">Kitchen</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[100px]">Tier</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[160px]">FSSAI</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[120px]">City Area</th>
                        <th className="text-right font-display font-bold px-5 py-3 min-w-[110px]">30d orders</th>
                        <th className="text-right font-display font-bold px-5 py-3 min-w-[130px]">30d earnings</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[120px]">Status</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[325px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cooks.map((c) => {
                        const isAwaitingFssai = c.status === 'AWAITING_FSSAI_FILING' || c.status === 'Fssai_Awaiting';
                        const isActive = c.status === 'ACTIVE' || c.status === 'Kitchen_Approved';

                        const orders30d = c.orders30d ?? 0;
                        const earnings30d = c.earnings30d ?? 0;
                        const rating = c.rating ?? 4.8;

                        return (
                          <tr
                            key={c.id}
                            className={cn(
                              "border-t border-line hover:bg-cream/40 transition-all",
                              isAwaitingFssai && "bg-primary-soft/5 border-l-2 border-l-primary"
                            )}
                          >
                            <td className="px-5 py-4 min-w-[220px]">
                              <div className="flex items-center gap-3.5">
                                <Link href={`/cooks/${c.id}`} className="h-10 w-10 rounded-2xl bg-primary text-white grid place-items-center text-[12px] font-display font-bold shrink-0 shadow-sm hover:opacity-90 transition-opacity">
                                  {initials(c.name)}
                                </Link>
                                <div className="min-w-0">
                                  <Link href={`/cooks/${c.id}`} className="font-display font-bold text-ink text-[13.5px] hover:text-primary transition-colors block truncate">
                                    {c.name}
                                  </Link>
                                  <p className="text-[11.5px] text-muted truncate mt-0.5">
                                    <span className="text-yellow-500 font-bold">★ {rating.toFixed(1)}</span> · {c.phone} · <span className="font-mono text-[10px] bg-cream px-1.5 py-0.5 rounded-md">{c.id}</span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-display text-[12.5px] font-bold min-w-[100px]">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-display font-bold shadow-sm",
                                c.tier === 1 
                                  ? "bg-bg text-ink border border-line" 
                                  : "bg-secondary-soft text-secondary border border-secondary/15"
                              )}>
                                Tier {c.tier}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-mono text-[12.5px] min-w-[160px] whitespace-nowrap">
                              {c.fssaiNumber ? (
                                <span className="text-ink-soft font-bold">{c.fssaiNumber}</span>
                              ) : isAwaitingFssai ? (
                                <span className="inline-flex items-center gap-1 text-primary font-bold font-display text-[12px] uppercase tracking-wide">
                                  ⚠️ Awaiting Filing
                                </span>
                              ) : (
                                <span className="text-muted font-normal">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-ink-soft font-display font-bold min-w-[120px] whitespace-nowrap">
                              {c.city || "Unknown"}
                            </td>
                            <td className="px-5 py-4 text-right font-mono font-bold text-ink-soft text-[12.5px] min-w-[110px]">{orders30d}</td>
                            <td className="px-5 py-4 text-right font-mono font-bold text-primary text-[12.5px] min-w-[130px] whitespace-nowrap">
                              {inr(earnings30d)}
                            </td>
                            <td className="px-5 py-4 min-w-[120px]">
                              <StatusChip status={c.status} />
                            </td>
                            <td className="px-5 py-4 min-w-[325px] whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {(c.status === 'PENDING_DOCS_APPROVAL' || c.status === 'Kitchen_Pending' || c.status === 'Fssai_Approved') && (
                                  <Link
                                    href={`/cooks/${c.id}`}
                                    className="h-8.5 px-3 rounded-xl bg-ink text-white text-[11.5px] font-display font-bold inline-flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-sm"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Verify docs
                                  </Link>
                                )}
                                <button
                                  onClick={() => handleOpenModal(c)}
                                  className={cn(
                                    "h-8.5 px-3 rounded-xl border text-[11.5px] font-display font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm",
                                    isAwaitingFssai
                                      ? "bg-primary text-white border-primary hover:opacity-90"
                                      : "bg-white text-ink-soft border-line hover:bg-cream/45 hover:border-ink/20"
                                  )}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  {isAwaitingFssai ? "File FSSAI" : "Update FSSAI"}
                                </button>
                                <button
                                  onClick={() => handleDeleteCook(c.id)}
                                  className="h-8.5 px-3 rounded-xl border bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 text-[11.5px] font-display font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls (Shared for both Grid and Table modes) */}
            <div className="card px-5 py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-bg/40">
              <p className="text-[12.5px] text-muted font-display">
                Showing Page <span className="font-bold text-ink">{page}</span> of{" "}
                <span className="font-bold text-ink">{totalPages}</span> ({totalCooks} total registered kitchens)
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="h-8.5 px-3 border border-line text-[12px] font-display font-bold hover:bg-cream/40"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8.5 px-3 border border-line text-[12px] font-display font-bold hover:bg-cream/40"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && selectedCook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl border border-line shadow-lift overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-line flex items-center justify-between bg-bg">
              <div>
                <h3 className="font-display font-bold text-base text-ink">Update FSSAI License</h3>
                <p className="text-[12px] text-muted mt-0.5">{selectedCook.name}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="h-8 w-8 rounded-full bg-surface border border-line text-muted hover:text-ink flex items-center justify-center hover:shadow-sm transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFssaiUpdate} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-error text-[12.5px] font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{modalError}</span>
                </div>
              )}
              {modalSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-[12.5px] font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              {/* FSSAI Number input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-[0.15em] font-display font-bold text-ink-soft">
                  FSSAI LICENSE NUMBER (14 digits)
                </label>
                <div className="relative flex items-center">
                  <FileText className="absolute left-3.5 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    maxLength={14}
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 23624003000999"
                    className="w-full h-11 pl-10 pr-3.5 bg-bg rounded-xl border border-line focus:border-primary focus:outline-none text-[13px] font-mono transition-all"
                    required
                  />
                </div>
              </div>

              {/* Expiry Date input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-[0.15em] font-display font-bold text-ink-soft">
                  EXPIRY DATE
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3.5 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    type="date"
                    value={fssaiExpiry}
                    onChange={(e) => setFssaiExpiry(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-bg rounded-xl border border-line focus:border-primary focus:outline-none text-[13px] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="text-[11.5px] text-ink-soft bg-cream/30 p-3 rounded-xl border border-line/60">
                💡 Entering these details will record the chef&apos;s FSSAI credentials and move their status to **Pending Docs** (Kitchen_Pending) for final review.
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-line">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={modalSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={modalSubmitting || modalSuccess !== ""}
                >
                  {modalSubmitting ? "Saving..." : "Save details"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Active", cls: "bg-success-soft text-success" },
    PENDING_DOCS_APPROVAL: { label: "Pending Docs", cls: "bg-primary-soft text-primary" },
    AWAITING_FSSAI_FILING: { label: "Awaiting Filing", cls: "bg-red-500/10 text-error border border-red-500/20" },
    NEW: { label: "New", cls: "bg-blue-50 text-blue-600 border border-blue-100" },
    REJECTED: { label: "Rejected", cls: "bg-cream text-muted" },
    
    // Backend values
    Kitchen_Approved: { label: "Active", cls: "bg-success-soft text-success" },
    Kitchen_Pending: { label: "Pending Docs", cls: "bg-primary-soft text-primary" },
    Fssai_Awaiting: { label: "Awaiting Filing", cls: "bg-red-500/10 text-error border border-red-500/20" },
    Fssai_Approved: { label: "Pending Docs", cls: "bg-primary-soft text-primary" },
    Kitchen_Rejected: { label: "Rejected", cls: "bg-red-500/10 text-error border border-red-500/15" }
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}
