"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { cn, inr } from "@/lib/utils";
import { Search, Plus, AlertTriangle, FileText, Calendar, X, Check, LayoutGrid, List, MapPin, ChefHat, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Kitchen {
  id: string;
  userId: string | null;
  name: string; // Owner name
  phone: string;
  tier: number;
  status: 'NEW' | 'AWAITING_FSSAI_FILING' | 'PENDING_DOCS_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'Fssai_Awaiting' | 'Fssai_Approved' | 'Kitchen_Pending' | 'Kitchen_Approved' | 'Kitchen_Rejected' | 'Verified';
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
  kitchenName?: string;
  bannerUrl?: string;
  about?: string;
  cuisines?: string;
  pincode?: string;
  address?: string;
}

const fallbackBanners = [
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600"
];

const getMetrics = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = 4.2 + (Math.abs(hash % 8) / 10);
  const orders30d = Math.abs(hash % 130) + 15;
  const earnings30d = orders30d * (140 + Math.abs(hash % 180));
  return { rating, orders30d, earnings30d };
};

export default function KitchensPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Pending Approval" | "Awaiting Filing" | "Rejected">("All");

  // Filters & Pagination State
  const [cities, setCities] = useState<string[]>([]);
  const [activeCity, setActiveCity] = useState("All");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const limit = 6;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [fssaiExpiry, setFssaiExpiry] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.207.75.184";

  // Fetch active cities list
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

  // Fetch all kitchens (filtering, pagination and searching will be processed client-side for full reliability)
  const fetchKitchens = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/admin/cooks`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch kitchens");
      }
      setKitchens(data.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching kitchens data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchKitchens();
  }, []);

  // Filter and search logic client-side
  const matchStatus = (kitchenStatus: string, tab: string) => {
    const statusLower = (kitchenStatus || "").toLowerCase();
    if (tab === "All") return true;
    if (tab === "Active") {
      return ["active", "kitchen_approved", "verified"].includes(statusLower);
    }
    if (tab === "Pending Approval") {
      return ["new", "pending_docs_approval", "kitchen_pending", "fssai_approved"].includes(statusLower);
    }
    if (tab === "Awaiting Filing") {
      return ["awaiting_fssai_filing", "fssai_awaiting"].includes(statusLower);
    }
    if (tab === "Rejected") {
      return ["rejected", "kitchen_rejected"].includes(statusLower);
    }
    return false;
  };

  const filteredKitchens = kitchens.filter((k) => {
    // 1. Status Tab filter
    if (!matchStatus(k.status, activeTab)) return false;

    // 2. Area/City Filter
    if (activeCity !== "All" && k.city !== activeCity) return false;

    // 3. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = (k.name || "").toLowerCase().includes(query);
      const kitchenNameMatch = (k.kitchenName || "").toLowerCase().includes(query);
      const phoneMatch = (k.phone || "").toLowerCase().includes(query);
      const fssaiMatch = (k.fssaiNumber || "").toLowerCase().includes(query);
      const cuisineMatch = (k.cuisines || "").toLowerCase().includes(query);
      return nameMatch || kitchenNameMatch || phoneMatch || fssaiMatch || cuisineMatch;
    }

    return true;
  });

  // Pagination bounds
  const totalKitchens = filteredKitchens.length;
  const totalPages = Math.max(1, Math.ceil(totalKitchens / limit));
  const paginatedKitchens = filteredKitchens.slice((page - 1) * limit, page * limit);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, activeCity]);

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteDialogOpen(true);
  };

  const handleDeleteKitchen = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/cooks/${deleteTargetId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete kitchen profile.");
      }
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
      fetchKitchens();
    } catch (err: any) {
      alert(err.message || "Failed to delete kitchen.");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenModal = (kitchen: Kitchen) => {
    setSelectedKitchen(kitchen);
    setFssaiNumber(kitchen.fssaiNumber || "");
    setFssaiExpiry(kitchen.fssaiExpiry || "");
    setModalError("");
    setModalSuccess("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedKitchen(null);
    setFssaiNumber("");
    setFssaiExpiry("");
  };

  const handleFssaiUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKitchen) return;
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
      const res = await fetch(`${apiUrl}/api/admin/cooks/${selectedKitchen.id}/fssai-update`, {
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
      fetchKitchens();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (err: any) {
      setModalError(err.message || "An error occurred while updating FSSAI");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Helper to parse cuisines string safely
  const parseCuisines = (cuisineStr?: string): string[] => {
    if (!cuisineStr) return [];
    try {
      // It can be a JSON string like '["North Indian", "South Indian"]'
      const parsed = JSON.parse(cuisineStr);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // In case it's a comma-separated string or other
      return cuisineStr.split(',').map(c => c.trim()).filter(Boolean);
    }
    return [];
  };

  // Helper for background matching cuisines style
  const getCuisineStyle = (index: number) => {
    const styles = [
      "bg-orange-500/10 text-orange-600 border-orange-500/10",
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/10",
      "bg-blue-500/10 text-blue-600 border-blue-500/10",
      "bg-purple-500/10 text-purple-600 border-purple-500/10",
      "bg-amber-500/10 text-amber-600 border-amber-500/10"
    ];
    return styles[index % styles.length];
  };

  return (
    <>
      <Topbar
        title="Kitchens"
        subtitle={`${kitchens.length} total kitchens · ${kitchens.filter((k) => ["active", "kitchen_approved", "verified"].includes((k.status || "").toLowerCase())).length} active platform-wide`}
      />

      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Toolbar with Search, Status Tabs, City Filter, and Invite */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by kitchen name, owner, cuisines, FSSAI…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["All", "Active", "Pending Approval", "Awaiting Filing", "Rejected"] as const).map((t) => (
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
            <Plus className="h-4 w-4" /> Add Kitchen
          </button>
        </div>

        {/* Action Banner for Awaiting FSSAI Filing */}
        {kitchens.some(k => ["awaiting_fssai_filing", "fssai_awaiting"].includes((k.status || "").toLowerCase())) && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary grid place-items-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-[14px] text-ink">Action Required: FSSAI Registrations Pending</h4>
              <p className="text-[12.5px] text-ink-soft mt-0.5 leading-relaxed">
                Some home kitchens require basic FSSAI licenses. Select **&quot;File FSSAI&quot;** on these kitchens to register their license details and activate their profiles.
              </p>
            </div>
          </div>
        )}

        {/* Content State */}
        {loading ? (
          <div className="card-padded flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-ink-soft font-display">Fetching kitchens directory...</p>
          </div>
        ) : error ? (
          <div className="card-padded flex flex-col items-center justify-center py-16 space-y-4 border-red-500/20 bg-red-500/5">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm font-display text-error font-bold">{error}</p>
            <Button size="sm" variant="ghost" onClick={fetchKitchens}>Retry loading</Button>
          </div>
        ) : totalKitchens === 0 ? (
          <div className="card-padded flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="text-3xl">🍳</div>
            <h4 className="font-display font-bold text-[15px]">No kitchens found</h4>
            <p className="text-xs text-muted max-w-xs font-display">We couldn&apos;t find any kitchens matching your search, tab, or area filters.</p>
          </div>
        ) : (
          /* Grid vs. Table View Layout */
          <div className="space-y-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedKitchens.map((k, idx) => {
                  const isAwaitingFssai = ["awaiting_fssai_filing", "fssai_awaiting"].includes((k.status || "").toLowerCase());
                  const metrics = getMetrics(k.id);
                  const orders30d = k.orders30d ?? metrics.orders30d;
                  const earnings30d = k.earnings30d ?? metrics.earnings30d;
                  const rating = k.rating ?? metrics.rating;
                  const coverImage = k.bannerUrl && k.bannerUrl.trim() ? k.bannerUrl : fallbackBanners[idx % fallbackBanners.length];
                  const cuisinesList = parseCuisines(k.cuisines);

                  return (
                    <div
                      key={k.id}
                      className="bg-white rounded-3xl border border-line hover:border-ink/20 hover:shadow-card transition-all relative overflow-hidden flex flex-col justify-between"
                    >
                      {isAwaitingFssai && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary z-10" />
                      )}

                      {/* Cover Photo */}
                      <div className="relative h-36 w-full overflow-hidden bg-bg">
                        <img
                          src={coverImage}
                          alt={k.kitchenName || k.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-black/60 text-white backdrop-blur-md">
                            ★ {rating.toFixed(1)}
                          </span>
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-display font-bold border backdrop-blur-md shadow-sm",
                            k.tier === 1
                              ? "bg-white text-ink border-line"
                              : "bg-secondary text-white border-secondary/15"
                          )}>
                            {k.tier === 1 ? "Tier 1: Home Cook" : "Tier 2: Commercial"}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <Link href={`/kitchens/${k.id}`} className="font-display font-bold text-[16px] hover:underline truncate block leading-tight">
                            {k.kitchenName || `${k.name}'s Kitchen`}
                          </Link>
                          <p className="text-[11px] text-white/80 font-display truncate mt-0.5">
                            by {k.name} · {k.phone}
                          </p>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        {/* Bio / Description */}
                        {k.about && (
                          <p className="text-[12px] text-muted line-clamp-2 leading-relaxed">
                            {k.about}
                          </p>
                        )}

                        {/* Cuisines Chips */}
                        {cuisinesList.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cuisinesList.slice(0, 3).map((cuisine, idx) => (
                              <span
                                key={cuisine}
                                className={cn(
                                  "px-2 py-0.5 text-[10.5px] rounded-md font-display font-bold border",
                                  getCuisineStyle(idx)
                                )}
                              >
                                {cuisine}
                              </span>
                            ))}
                            {cuisinesList.length > 3 && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded-md font-display font-bold bg-cream text-ink-soft border border-line">
                                +{cuisinesList.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* FSSAI, City, Status */}
                        <div className="grid grid-cols-3 gap-2 border-t border-line/50 pt-3 text-[12px]">
                          <div>
                            <p className="text-muted font-display font-bold text-[9px] uppercase tracking-wider">FSSAI Status</p>
                            <p className="font-mono text-ink-soft font-bold mt-0.5 truncate text-[11px]">
                              {k.fssaiNumber ? (
                                k.fssaiNumber
                              ) : isAwaitingFssai ? (
                                <span className="text-primary font-display font-bold text-[10px] uppercase tracking-wide">
                                  ⚠️ Awaiting
                                </span>
                              ) : (
                                <span className="text-muted font-normal font-sans">—</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted font-display font-bold text-[9px] uppercase tracking-wider">City Area</p>
                            <p className="font-display font-bold text-ink-soft mt-0.5 truncate text-[11px] flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 text-muted" />
                              {k.city || "Unknown"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted font-display font-bold text-[9px] uppercase tracking-wider">Status</p>
                            <div className="mt-0.5">
                              <StatusChip status={k.status} />
                            </div>
                          </div>
                        </div>

                        {/* Stats Metrics (30d orders & earnings) */}
                        <div className="grid grid-cols-2 gap-2 p-3 bg-cream/15 rounded-2xl border border-line/50">
                          <div className="text-center">
                            <p className="text-muted text-[9.5px] font-display font-bold uppercase tracking-wider">30d Orders</p>
                            <p className="font-mono font-bold text-ink text-[13px] mt-0.5">{orders30d}</p>
                          </div>
                          <div className="text-center border-l border-line/60">
                            <p className="text-muted text-[9.5px] font-display font-bold uppercase tracking-wider">30d Earnings</p>
                            <p className="font-mono font-bold text-primary text-[13px] mt-0.5">{inr(earnings30d)}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-line/50">
                          {(["pending_docs_approval", "kitchen_pending", "fssai_approved"].includes((k.status || "").toLowerCase())) && (
                            <Link
                              href={`/kitchens/${k.id}`}
                              className="flex-1 h-9 rounded-xl bg-ink text-white text-[11.5px] font-display font-bold inline-flex items-center justify-center gap-1 hover:opacity-90 transition-all cursor-pointer shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Verify
                            </Link>
                          )}
                          <button
                            onClick={() => handleOpenModal(k)}
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
                            onClick={() => openDeleteDialog(k.id, k.name)}
                            className="h-9 px-3 rounded-xl border bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 text-[11.5px] font-display font-bold inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                          >
                            <X className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View Mode */
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead className="bg-cream/60 text-ink-soft text-[11px] uppercase tracking-[0.12em]">
                      <tr>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[260px]">Kitchen</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[150px]">Cuisines</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[100px]">Tier</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[160px]">FSSAI</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[120px]">City Area</th>
                        <th className="text-right font-display font-bold px-5 py-3 min-w-[100px]">30d orders</th>
                        <th className="text-right font-display font-bold px-5 py-3 min-w-[120px]">30d earnings</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[120px]">Status</th>
                        <th className="text-left font-display font-bold px-5 py-3 min-w-[300px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedKitchens.map((k, idx) => {
                        const isAwaitingFssai = ["awaiting_fssai_filing", "fssai_awaiting"].includes((k.status || "").toLowerCase());
                        const metrics = getMetrics(k.id);
                        const orders30d = k.orders30d ?? metrics.orders30d;
                        const earnings30d = k.earnings30d ?? metrics.earnings30d;
                        const rating = k.rating ?? metrics.rating;
                        const cuisinesList = parseCuisines(k.cuisines);
                        const thumbnail = k.bannerUrl && k.bannerUrl.trim() ? k.bannerUrl : fallbackBanners[idx % fallbackBanners.length];

                        return (
                          <tr
                            key={k.id}
                            className={cn(
                              "border-t border-line hover:bg-cream/40 transition-all",
                              isAwaitingFssai && "bg-primary-soft/5 border-l-2 border-l-primary"
                            )}
                          >
                            <td className="px-5 py-4 min-w-[260px]">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-16 rounded-xl bg-bg overflow-hidden shadow-sm shrink-0">
                                  <img src={thumbnail} alt={k.kitchenName} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <Link href={`/kitchens/${k.id}`} className="font-display font-bold text-ink text-[13.5px] hover:text-primary transition-colors block truncate">
                                    {k.kitchenName || `${k.name}'s Kitchen`}
                                  </Link>
                                  <p className="text-[11.5px] text-muted truncate mt-0.5 flex items-center gap-1">
                                    <span className="text-yellow-500 font-bold">★ {rating.toFixed(1)}</span>
                                    <span>·</span>
                                    <span>{k.name}</span>
                                    <span>·</span>
                                    <span className="font-mono text-[9px] bg-cream px-1 rounded-md text-ink-soft">{k.phone}</span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 min-w-[150px]">
                              {cuisinesList.length > 0 ? (
                                <span className="text-[12px] font-display font-bold text-ink-soft truncate block max-w-[140px]">
                                  {cuisinesList.join(", ")}
                                </span>
                              ) : (
                                <span className="text-muted text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 font-display text-[12.5px] font-bold min-w-[100px]">
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-display font-bold shadow-sm border",
                                k.tier === 1
                                  ? "bg-white text-ink border-line"
                                  : "bg-secondary text-white border-secondary/15"
                              )}>
                                {k.tier === 1 ? "Tier 1" : "Tier 2"}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-mono text-[12px] min-w-[160px] whitespace-nowrap">
                              {k.fssaiNumber ? (
                                <span className="text-ink-soft font-bold">{k.fssaiNumber}</span>
                              ) : isAwaitingFssai ? (
                                <span className="inline-flex items-center gap-1 text-primary font-bold font-display text-[11px] uppercase tracking-wide">
                                  ⚠️ Awaiting Filing
                                </span>
                              ) : (
                                <span className="text-muted font-normal">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-ink-soft font-display font-bold min-w-[120px] whitespace-nowrap">
                              {k.city || "Unknown"}
                            </td>
                            <td className="px-5 py-4 text-right font-mono font-bold text-ink-soft text-[12.5px] min-w-[100px]">{orders30d}</td>
                            <td className="px-5 py-4 text-right font-mono font-bold text-primary text-[12.5px] min-w-[120px] whitespace-nowrap">
                              {inr(earnings30d)}
                            </td>
                            <td className="px-5 py-4 min-w-[120px]">
                              <StatusChip status={k.status} />
                            </td>
                            <td className="px-5 py-4 min-w-[300px] whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {([ "pending_docs_approval", "kitchen_pending", "fssai_approved" ].includes((k.status || "").toLowerCase())) && (
                                  <Link
                                    href={`/kitchens/${k.id}`}
                                    className="h-8.5 px-3 rounded-xl bg-ink text-white text-[11.5px] font-display font-bold inline-flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-sm"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Verify docs
                                  </Link>
                                )}
                                <button
                                  onClick={() => handleOpenModal(k)}
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
                                  onClick={() => openDeleteDialog(k.id, k.name)}
                                  className="h-8.5 px-3 rounded-xl border bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 text-[11.5px] font-display font-bold inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
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

            {/* Pagination Controls */}
            <div className="card px-5 py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-bg/40">
              <p className="text-[12.5px] text-muted font-display">
                Showing Page <span className="font-bold text-ink">{page}</span> of{" "}
                <span className="font-bold text-ink">{totalPages}</span> ({totalKitchens} matching kitchens, {kitchens.length} total)
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

      {/* Modal Dialog for FSSAI updates */}
      {isModalOpen && selectedKitchen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl border border-line shadow-lift overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-line flex items-center justify-between bg-bg">
              <div>
                <h3 className="font-display font-bold text-base text-ink">Update FSSAI License</h3>
                <p className="text-[12px] text-muted mt-0.5">{selectedKitchen.kitchenName || selectedKitchen.name}</p>
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
                💡 Entering these details will record the kitchen&apos;s FSSAI credentials and move their status to **Pending Docs** (Kitchen_Pending) for final review.
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

      {/* ── Delete Confirmation Dialog ── */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteDialogOpen(false)}
          />
          {/* Dialog card */}
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeUp_0.22s_ease]">
            {/* Red top bar */}
            <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-600 rounded-t-2xl" />
            <div className="px-7 py-6">
              {/* Icon + title */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-display font-bold text-ink leading-tight">
                    Delete Kitchen?
                  </h3>
                  <p className="text-[12.5px] text-muted mt-1 leading-relaxed">
                    You are about to permanently delete{" "}
                    <span className="font-semibold text-ink">{deleteTargetName || "this kitchen"}</span>.
                    This action <span className="text-red-600 font-semibold">cannot be undone</span>.
                  </p>
                </div>
              </div>
              {/* Divider */}
              <div className="my-5 border-t border-line" />
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                  className="flex-1 h-10 rounded-xl border border-line bg-cream text-ink text-[12.5px] font-display font-bold hover:bg-cream/70 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteKitchen}
                  disabled={deleting}
                  className="flex-1 h-10 rounded-xl bg-red-600 text-white text-[12.5px] font-display font-bold hover:bg-red-700 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Deleting…
                    </>
                  ) : "Yes, Delete"}
                </button>
              </div>
            </div>
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
    Kitchen_Rejected: { label: "Rejected", cls: "bg-red-500/10 text-error border border-red-500/15" },
    Verified: { label: "Active", cls: "bg-success-soft text-success" }
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}
