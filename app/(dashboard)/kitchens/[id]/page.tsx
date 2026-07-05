"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Check, X, FileText, Calendar, ShieldCheck,
  AlertCircle, Loader2, MapPin, ChefHat, Info, ExternalLink,
  Image as ImageIcon, User, Phone, Clock, Package, Truck, UtensilsCrossed
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Types                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

interface KitchenDetails {
  id: string;
  userId: string | null;
  name: string;
  phone: string;
  tier: number;
  status: string;
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
  state?: string;
  landmark?: string;
  streetAddress?: string;
  pincode?: string;
  appliedAt: string;
  rejectionReason?: string;
  capacity?: number;
  cutoffNotice?: string;
  packagingType?: string;
  deliveryMode?: string;
  weeklyOff?: string[];
  address?: string;
  selfieUrl?: string;
  cookingUrl?: string | null;
  storageUrl?: string | null;
  sinkUrl?: string | null;
  aadhaarUrl?: string;
  panUrl?: string;
  fssaiUrl?: string;
  kitchenName?: string;
  bannerUrl?: string;
  about?: string;
  cuisines?: string;
  lat?: number;
  lng?: number;
  meals?: { breakfast: boolean; lunch: boolean; dinner: boolean };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

const STATUS_LOWER = (s: string) => (s || "").toLowerCase();

const PENDING_STATUSES  = ["kitchen_pending", "pending_docs_approval"];
const FSSAI_STATUSES    = ["fssai_awaiting", "awaiting_fssai_filing"];
const FSSAI_DONE        = ["fssai_approved"];
const APPROVED_STATUSES = ["kitchen_approved", "active", "verified"];
const REJECTED_STATUSES = ["kitchen_rejected", "rejected"];

const hasFssai = (k: KitchenDetails) =>
  k.hasExistingFssai || (!!k.fssaiNumber && k.fssaiNumber.trim() !== "");

/* ─────────────────────────────────────────────────────────────────────────── */
/* Page                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function KitchenDetailsPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [kitchen,       setKitchen]       = useState<KitchenDetails | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectForm,setShowRejectForm]= useState(false);
  const [rejectReason,  setRejectReason]  = useState("");
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [toasts, setToasts]               = useState<{ id: string; message: string; type: "success"|"error"|"info" }[]>([]);
  const [lightbox, setLightbox]           = useState<{ src: string; title: string } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.207.75.184";

  const toast = (message: string, type: "success"|"error"|"info" = "success") => {
    const toastId = Math.random().toString(36).slice(2, 9);
    setToasts(p => [...p, { id: toastId, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== toastId)), 4000);
  };

  const fetchKitchenDetails = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${apiUrl}/api/admin/cooks/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load.");
      // Admin endpoint returns: { success, data: <cook_object> }
      // Kitchen endpoint returns: { success, data: { cook: <cook_object> } }
      const cook = data.data?.cook ?? data.data;
      setKitchen(cook);
    } catch (e: any) {
      setError(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchKitchenDetails(); }, [id]);

  const handleVerify = async (approve: boolean) => {
    if (!approve && !rejectReason.trim()) { toast("Please provide a rejection reason.", "error"); return; }
    setActionLoading(true);
    try {
      const res  = await fetch(`${apiUrl}/api/admin/cooks/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve, reason: approve ? undefined : rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed.");
      toast(approve ? "Kitchen approved successfully! ✅" : "Kitchen application rejected.", approve ? "success" : "info");
      setShowRejectForm(false); setRejectReason("");
      fetchKitchenDetails();
    } catch (e: any) {
      toast(e.message || "Action failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res  = await fetch(`${apiUrl}/api/admin/cooks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed.");
      setDeleteOpen(false);
      toast("Kitchen deleted.", "success");
      setTimeout(() => router.push("/kitchens"), 1000);
    } catch (e: any) {
      toast(e.message || "Delete failed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ── loading / error states ── */
  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-sm text-ink-soft font-display font-bold">Loading kitchen profile…</p>
    </div>
  );

  if (error || !kitchen) return (
    <div className="flex-1 p-8 max-w-lg mx-auto text-center">
      <div className="card-padded border border-red-200 bg-red-50/5 space-y-4">
        <AlertCircle className="h-12 w-12 text-error mx-auto" />
        <h3 className="font-display font-bold text-ink text-[16px]">Failed to Load</h3>
        <p className="text-[13px] text-muted leading-relaxed">{error || "Kitchen not found."}</p>
        <Button variant="primary" size="sm" onClick={fetchKitchenDetails} className="mx-auto">Retry</Button>
      </div>
    </div>
  );

  /* ── derived state ── */
  const statusLow = STATUS_LOWER(kitchen.status);
  const isPending  = PENDING_STATUSES.includes(statusLow);
  const isFssaiAwait = FSSAI_STATUSES.includes(statusLow);
  const isFssaiDone  = FSSAI_DONE.includes(statusLow);
  const isApproved   = APPROVED_STATUSES.includes(statusLow);
  const isRejected   = REJECTED_STATUSES.includes(statusLow);
  const kitchenHasFssai = hasFssai(kitchen);

  // Approval is only possible when:
  //  a) status is Kitchen_Pending AND fssai exists (or tier 1 waiver)
  //  b) status is Fssai_Approved
  const canApprove = isPending && kitchenHasFssai || isFssaiDone;
  const needsFssaiFirst = isPending && !kitchenHasFssai;

  let cuisinesList: string[] = [];
  if (kitchen.cuisines) {
    try { const p = JSON.parse(kitchen.cuisines); if (Array.isArray(p)) cuisinesList = p; }
    catch { cuisinesList = kitchen.cuisines.split(",").map(c => c.trim()).filter(Boolean); }
  }

  const cuisineColors = [
    "bg-orange-500/10 text-orange-700 border-orange-500/15",
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/15",
    "bg-blue-500/10 text-blue-700 border-blue-500/15",
    "bg-purple-500/10 text-purple-700 border-purple-500/15",
    "bg-amber-500/10 text-amber-700 border-amber-500/15",
  ];

  return (
    <>
      <Topbar
        title="Kitchen Detail"
        subtitle={`Reviewing · ${kitchen.kitchenName || kitchen.name}`}
      />

      <div className="flex-1 p-5 lg:p-8 space-y-6 max-w-7xl">

        {/* Back */}
        <Link href="/kitchens" className="inline-flex items-center gap-1.5 text-muted hover:text-ink text-[13px] font-display font-bold transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Kitchens
        </Link>

        {/* ── Banner Hero ── */}
        <div className="relative h-60 w-full overflow-hidden rounded-3xl border border-line shadow-sm">
          {kitchen.bannerUrl ? (
            <img src={kitchen.bannerUrl} alt={kitchen.kitchenName || kitchen.name}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/15 to-transparent flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display font-bold text-[22px] text-white leading-tight">
                {kitchen.kitchenName || `${kitchen.name}'s Kitchen`}
              </h2>
              <p className="text-[12.5px] text-white/75 font-display flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{kitchen.name}</span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{kitchen.phone}</span>
                {kitchen.city && <><span className="opacity-40">·</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{kitchen.city}</span></>}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10.5px] font-display font-bold border backdrop-blur-md",
                kitchen.tier === 1 ? "bg-white/90 text-ink border-transparent" : "bg-secondary text-white border-secondary/20"
              )}>
                {kitchen.tier === 1 ? "🏠 Tier 1 · Home Cook" : "🏭 Tier 2 · Licensed"}
              </span>
              <StatusChip status={kitchen.status} />
            </div>
          </div>
        </div>

        {/* ── Rejection banner ── */}
        {isRejected && kitchen.rejectionReason && (
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-display font-bold text-error mb-0.5">Rejection Reason</p>
              <p className="text-[12.5px] text-red-700 italic">&ldquo;{kitchen.rejectionReason}&rdquo;</p>
            </div>
          </div>
        )}

        {/* ── FSSAI-first warning banner ── */}
        {needsFssaiFirst && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-display font-bold text-amber-800 mb-0.5">FSSAI License Required Before Approval</p>
              <p className="text-[12px] text-amber-700 leading-relaxed">
                This kitchen has not filed an FSSAI license yet. Go to the Kitchens list → <strong>File FSSAI</strong> first. Once FSSAI is filed and approved, you can approve this kitchen.
              </p>
            </div>
          </div>
        )}

        {/* ── Main 3-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Info columns (2/3 width) */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Owner Selfie + About ── */}
            <div className="card bg-white border border-line/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line/40 bg-bg flex items-center gap-2">
                <User className="h-4 w-4 text-muted" />
                <h3 className="font-display font-bold text-ink text-[13.5px]">Owner Profile</h3>
              </div>
              <div className="p-5 flex flex-col sm:flex-row gap-5">
                {/* Selfie */}
                <div className="shrink-0">
                  {kitchen.selfieUrl ? (
                    <button
                      onClick={() => setLightbox({ src: kitchen.selfieUrl!, title: "Owner Selfie" })}
                      className="block w-24 h-24 rounded-2xl overflow-hidden border-2 border-line hover:border-primary/40 transition-all shadow-sm hover:shadow-md cursor-zoom-in"
                    >
                      <img src={kitchen.selfieUrl} alt="Owner selfie" className="w-full h-full object-cover" />
                    </button>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-cream/60 border border-line flex flex-col items-center justify-center gap-1">
                      <User className="h-7 w-7 text-muted/50" />
                      <span className="text-[9px] font-bold text-muted">No Photo</span>
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-muted text-center mt-1.5 uppercase tracking-wider">Selfie</p>
                </div>

                {/* Info grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-0">
                  <InfoRow label="Owner Name" value={kitchen.name} />
                  <InfoRow label="Phone" value={kitchen.phone} />
                  <InfoRow label="WhatsApp" value={kitchen.whatsapp || "—"} />
                  <InfoRow label="Alt Contact" value={kitchen.altContact || "—"} />
                  <InfoRow label="Date of Birth" value={kitchen.dob || "—"} />
                  <InfoRow label="Registered On" value={new Date(kitchen.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
                </div>
              </div>

              {/* About section */}
              {kitchen.about && (
                <div className="px-5 pb-5">
                  <div className="p-4 rounded-xl bg-cream/30 border border-line/50">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">About the Kitchen</p>
                    <p className="text-[13px] text-ink-soft leading-relaxed italic">&ldquo;{kitchen.about}&rdquo;</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Cuisines & Operations ── */}
            <div className="card bg-white border border-line/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line/40 bg-bg flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-muted" />
                <h3 className="font-display font-bold text-ink text-[13.5px]">Cuisine & Operations</h3>
              </div>
              <div className="p-5 space-y-5">
                {/* Cuisines */}
                {cuisinesList.length > 0 ? (
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Cuisines Offered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cuisinesList.map((c, i) => (
                        <span key={c} className={cn("px-3 py-1 text-[11.5px] rounded-lg font-display font-bold border", cuisineColors[i % cuisineColors.length])}>{c}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Meals */}
                {kitchen.meals && (
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Meals</p>
                    <div className="flex gap-2 flex-wrap">
                      {[["Breakfast", kitchen.meals.breakfast], ["Lunch", kitchen.meals.lunch], ["Dinner", kitchen.meals.dinner]].map(([name, active]) => (
                        <span key={name as string} className={cn(
                          "px-3 py-1.5 rounded-xl text-[11.5px] font-display font-bold border",
                          active ? "bg-success-soft text-success border-success/20" : "bg-cream/40 text-muted border-line"
                        )}>
                          {active ? "✓" : "✗"} {name as string}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operations grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  <InfoRow label="Dietary" value={kitchen.isVegOnly ? "Pure Veg 🟢" : "Veg & Non-Veg 🔴"} />
                  <InfoRow label="Daily Capacity" value={kitchen.capacity ? `${kitchen.capacity} meals/day` : "—"} />
                  <InfoRow label="Order Cutoff" value={kitchen.cutoffNotice || "—"} />
                  <InfoRow label="Packaging" value={kitchen.packagingType || "—"} />
                  <InfoRow label="Delivery" value={kitchen.deliveryMode || "—"} />
                  <InfoRow label="Weekly Off" value={kitchen.weeklyOff?.length ? kitchen.weeklyOff.join(", ") : "None"} />
                </div>
              </div>
            </div>

            {/* ── Address ── */}
            <div className="card bg-white border border-line/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line/40 bg-bg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted" />
                <h3 className="font-display font-bold text-ink text-[13.5px]">Address</h3>
                {(kitchen.lat || kitchen.lng) && (
                  <span className="ml-auto text-[11px] font-mono text-muted bg-cream px-2 py-0.5 rounded-lg border border-line">
                    {kitchen.lat?.toFixed(4)}, {kitchen.lng?.toFixed(4)}
                  </span>
                )}
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                <InfoRow label="Street / Door" value={kitchen.streetAddress || "—"} />
                <InfoRow label="Landmark" value={kitchen.landmark || "—"} />
                <InfoRow label="City" value={kitchen.city || "—"} />
                <InfoRow label="State" value={kitchen.state || "—"} />
                <InfoRow label="Pincode" value={kitchen.pincode || "—"} />
              </div>
              {kitchen.address && (
                <div className="px-5 pb-5">
                  <p className="text-[12.5px] text-ink-soft leading-relaxed bg-cream/20 p-3 rounded-xl border border-line/50">{kitchen.address}</p>
                </div>
              )}
            </div>

            {/* ── Kitchen Interior Photos ── */}
            <div className="card bg-white border border-line/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line/40 bg-bg flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted" />
                <h3 className="font-display font-bold text-ink text-[13.5px]">Kitchen Interior Photos</h3>
                <span className="ml-auto text-[10px] font-bold text-muted bg-cream px-2 py-0.5 rounded-md border border-line">
                  {[kitchen.cookingUrl, kitchen.storageUrl, kitchen.sinkUrl].filter(Boolean).length}/3 uploaded
                </span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                <InteriorPhoto title="Cooking Area" imageUrl={kitchen.cookingUrl} onView={setLightbox} />
                <InteriorPhoto title="Storage Area" imageUrl={kitchen.storageUrl} onView={setLightbox} />
                <InteriorPhoto title="Sink / Wash" imageUrl={kitchen.sinkUrl} onView={setLightbox} />
              </div>
            </div>

          </div>

          {/* RIGHT: Actions + KYC (1/3 width) */}
          <div className="space-y-5">

            {/* ── Action Card ── */}
            {/* NOTE: Do NOT put overflow-hidden on sticky elements — it breaks sticky in Chrome/Safari */}
            <div className="bg-white border border-line/60 rounded-2xl shadow-md sticky top-20 z-10">
              {/* Header */}
              <div className={cn(
                "px-5 py-4 border-b border-line/40 flex items-center gap-2 rounded-t-2xl",
                canApprove    ? "bg-primary/5"   :
                needsFssaiFirst || isFssaiAwait ? "bg-amber-50" : "bg-bg"
              )}>
                <ShieldCheck className={cn("h-4 w-4", canApprove ? "text-primary" : needsFssaiFirst || isFssaiAwait ? "text-amber-500" : "text-muted")} />
                <h3 className="font-display font-bold text-ink text-[13.5px]">
                  {isApproved      ? "Kitchen Status"    :
                   isRejected      ? "Application Rejected" :
                   isFssaiAwait    ? "FSSAI Pending"     :
                   needsFssaiFirst ? "Approval Steps"    : "Verify Kitchen"}
                </h3>
              </div>

              <div className="p-5">

                {/* ── APPROVED ── */}
                {isApproved && (
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 rounded-full bg-success-soft border border-success/20 flex items-center justify-center mx-auto">
                      <ShieldCheck className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-[13px] font-display font-bold text-success">Kitchen Approved & Active</p>
                    <p className="text-[11.5px] text-muted">This kitchen is live on the platform.</p>
                  </div>
                )}

                {/* ── REJECTED ── */}
                {isRejected && !isApproved && (
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
                      <X className="h-6 w-6 text-error" />
                    </div>
                    <p className="text-[13px] font-display font-bold text-error">Application Rejected</p>
                    <p className="text-[11.5px] text-muted leading-relaxed">The cook can re-apply after fixing the issues.</p>
                    <div className="pt-2 border-t border-line">
                      <Button variant="primary" size="sm" onClick={() => handleVerify(true)} disabled={actionLoading}
                        className="w-full h-9 rounded-xl text-[12px] font-display font-bold flex items-center justify-center gap-1.5">
                        {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Re-Approve Kitchen
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── FSSAI AWAITING (admin must file FSSAI from list) ── */}
                {isFssaiAwait && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
                      <p className="text-[12.5px] font-display font-bold text-amber-800">FSSAI Filing Required</p>
                      <p className="text-[11.5px] text-amber-700 leading-relaxed">Enter the FSSAI license number and expiry date from the Kitchens dashboard, then come back to approve.</p>
                    </div>
                    <Link href="/kitchens"
                      className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-display font-bold transition-colors">
                      Go to Kitchens → File FSSAI
                    </Link>
                  </div>
                )}

                {/* ── NEEDS FSSAI FIRST — premium step indicator ── */}
                {needsFssaiFirst && (
                  <div className="space-y-4">
                    <p className="text-[11.5px] text-muted leading-relaxed">
                      Before approving this kitchen, FSSAI must be filed first. Follow the two steps below.
                    </p>

                    {/* Step 1 — File FSSAI (required first) */}
                    <div className="flex gap-3 items-start p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[11px] font-display font-bold mt-0.5">1</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-display font-bold text-amber-800">File FSSAI License</p>
                        <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">Go to the Kitchens list and enter the FSSAI number + expiry date for this cook.</p>
                        <Link href="/kitchens"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-display font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
                          Open Kitchens List →
                        </Link>
                      </div>
                    </div>

                    {/* Step 2 — Approve Kitchen (locked) */}
                    <div className="flex gap-3 items-start p-3 rounded-xl bg-cream/40 border border-line/50 opacity-50">
                      <div className="w-7 h-7 rounded-full bg-line text-muted flex items-center justify-center shrink-0 text-[11px] font-display font-bold mt-0.5">2</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-display font-bold text-ink-soft">Approve Kitchen</p>
                        <p className="text-[11px] text-muted leading-relaxed mt-0.5">Once FSSAI is filed, come back here to approve the kitchen profile.</p>
                      </div>
                      <div className="shrink-0 mt-0.5">
                        <span className="text-[9.5px] font-bold text-muted bg-line/60 px-2 py-0.5 rounded-full border border-line">Locked</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── READY TO APPROVE ── */}
                {canApprove && !showRejectForm && (
                  <div className="space-y-2">
                    <p className="text-[12px] text-muted leading-relaxed mb-3">
                      Documents and FSSAI verified. You can now approve this kitchen.
                    </p>
                    <Button variant="primary" onClick={() => handleVerify(true)} disabled={actionLoading}
                      className="w-full h-10 rounded-xl font-display font-bold text-[13px] flex items-center justify-center gap-1.5">
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve Kitchen
                    </Button>
                    <button onClick={() => setShowRejectForm(true)} disabled={actionLoading}
                      className="w-full h-9 rounded-xl border border-line hover:border-red-300 hover:text-error text-ink-soft text-[12.5px] font-display font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                      <X className="h-3.5 w-3.5" />Reject Application
                    </button>
                  </div>
                )}

                {/* ── Reject form ── */}
                {(canApprove || isApproved) && showRejectForm && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Rejection Reason</label>
                      <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                        placeholder="e.g. Address mismatch or FSSAI number invalid."
                        className="w-full p-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-red-400 placeholder:text-muted/65 font-sans resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                        className="flex-1 h-9 rounded-xl text-[12px] font-display font-bold border border-line text-muted hover:bg-cream/40 cursor-pointer transition-all">Cancel</button>
                      <button onClick={() => handleVerify(false)} disabled={actionLoading}
                        className="flex-1 h-9 rounded-xl text-[12px] font-display font-bold bg-error hover:bg-error/90 text-white flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-60">
                        {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── KYC Documents ── */}
            <div className="card bg-white border border-line/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line/40 bg-bg flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted" />
                <h3 className="font-display font-bold text-ink text-[13.5px]">KYC Documents</h3>
              </div>
              <div className="p-4 space-y-3">
                <DocCard title="Aadhaar Card" number={kitchen.aadhaarNo} imageUrl={kitchen.aadhaarUrl} onView={setLightbox} />
                <DocCard title="PAN Card" number={kitchen.panNo} imageUrl={kitchen.panUrl} onView={setLightbox} />
                <DocCard
                  title="FSSAI License"
                  number={kitchen.fssaiNumber}
                  expiry={kitchen.fssaiExpiry}
                  imageUrl={kitchen.fssaiUrl}
                  isFssai
                  onView={setLightbox}
                />
              </div>
            </div>

            {/* ── Danger Zone ── */}
            <div className="rounded-2xl border border-red-200/70 bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-red-100 bg-red-50/40 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h3 className="font-display font-bold text-red-700 text-[13px]">Danger Zone</h3>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-[12px] text-muted leading-relaxed">Permanently delete this kitchen profile and all data. Irreversible.</p>
                <button onClick={() => setDeleteOpen(true)} disabled={actionLoading}
                  className="w-full h-10 rounded-xl font-display font-bold text-[13px] bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <X className="h-4 w-4" />Delete Kitchen Profile
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-display font-bold text-[14px]">{lightbox.title}</span>
              <div className="flex items-center gap-2">
                <a href={lightbox.src} target="_blank" rel="noopener noreferrer"
                  className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-display font-bold flex items-center gap-1.5 transition-all">
                  <ExternalLink className="h-3.5 w-3.5" />Open Original
                </a>
                <button onClick={() => setLightbox(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <img src={lightbox.src} alt={lightbox.title}
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-black/20" />
          </div>
        </div>
      )}

      {/* ── Toast Stack ── */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "p-4 rounded-2xl border shadow-lift flex items-start gap-3 bg-white/95 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-5",
            t.type === "success" && "border-success/20",
            t.type === "error"   && "border-error/20",
            t.type === "info"    && "border-secondary/20"
          )}>
            {t.type === "success" && <Check      className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" />}
            {t.type === "error"   && <X          className="h-4.5 w-4.5 text-error mt-0.5 shrink-0" />}
            {t.type === "info"    && <AlertCircle className="h-4.5 w-4.5 text-secondary mt-0.5 shrink-0" />}
            <div className="flex-1 text-[12px] font-medium">{t.message}</div>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="text-muted hover:text-ink transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Delete Confirm Dialog ── */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteOpen(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-600" />
            <div className="px-7 py-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-display font-bold text-ink">Delete Kitchen Profile?</h3>
                  <p className="text-[12.5px] text-muted mt-1 leading-relaxed">
                    You are about to permanently delete{" "}
                    <span className="font-semibold text-ink">{kitchen?.kitchenName || kitchen?.name}</span>.{" "}
                    This <span className="text-red-600 font-semibold">cannot be undone</span>.
                  </p>
                </div>
              </div>
              <div className="my-5 border-t border-line" />
              <div className="flex gap-3">
                <button onClick={() => setDeleteOpen(false)} disabled={deleting}
                  className="flex-1 h-10 rounded-xl border border-line bg-cream text-ink text-[12.5px] font-display font-bold hover:bg-cream/70 transition-all disabled:opacity-50 cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 h-10 rounded-xl bg-red-600 text-white text-[12.5px] font-display font-bold hover:bg-red-700 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer">
                  {deleting ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Deleting…</> : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Sub-components                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2 border-b border-line/25 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
      <span className="text-[11.5px] text-muted font-medium">{label}</span>
      <span className="text-[12.5px] font-display font-bold text-ink-soft sm:text-right">{value}</span>
    </div>
  );
}

function DocCard({
  title, number, expiry, imageUrl, isFssai = false, onView
}: {
  title: string; number?: string; expiry?: string; imageUrl?: string; isFssai?: boolean;
  onView: (v: { src: string; title: string }) => void;
}) {
  const hasImage  = !!imageUrl && imageUrl.trim() !== "";
  const hasNumber = !!number && number.trim() !== "";

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden",  // overflow-hidden here clips the image to the rounded corners
      hasImage ? "border-line" : isFssai && !hasNumber ? "border-amber-200 bg-amber-50/30" : "border-line bg-cream/20"
    )}>
      {/* Image strip — clipped by parent div's overflow-hidden + rounded-xl */}
      {hasImage && (
        <div className="w-full h-28 overflow-hidden relative bg-cream/30">
          <button
            onClick={() => onView({ src: imageUrl!, title })}
            className="absolute inset-0 w-full h-full cursor-zoom-in group"
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all flex items-center justify-center">
              <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
          </button>
        </div>
      )}

      <div className={cn("px-3 py-2.5 flex items-center gap-2.5", !hasImage && "py-3")}>
        <div className="h-8 w-8 rounded-lg bg-cream/60 flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4 text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11.5px] font-display font-bold text-ink">{title}</p>
          {hasNumber ? (
            <p className="text-[11px] font-mono text-ink-soft truncate">{number}{expiry ? ` · Exp ${expiry}` : ""}</p>
          ) : (
            <p className="text-[10.5px] text-muted italic">{isFssai ? "Not filed yet" : "Not uploaded"}</p>
          )}
        </div>
        <span className={cn(
          "text-[9.5px] font-display font-bold px-2 py-0.5 rounded-full border shrink-0",
          hasImage && hasNumber ? "bg-success-soft text-success border-success/20"
            : isFssai && !hasNumber ? "bg-amber-100 text-amber-700 border-amber-300"
            : "bg-red-50 text-error border-red-200"
        )}>
          {hasImage && hasNumber ? "✓ OK" : isFssai && !hasNumber ? "Pending" : "Missing"}
        </span>
      </div>
    </div>
  );
}

function InteriorPhoto({
  title, imageUrl, onView
}: {
  title: string; imageUrl?: string | null;
  onView: (v: { src: string; title: string }) => void;
}) {
  const has = !!imageUrl && imageUrl.trim() !== "";
  return (
    <div className="flex flex-col gap-1.5">
      {has ? (
        <button
          onClick={() => onView({ src: imageUrl!, title })}
          className="block w-full aspect-[4/3] rounded-xl overflow-hidden border border-line cursor-zoom-in group relative"
        >
          <img src={imageUrl!} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </button>
      ) : (
        <div className="w-full aspect-[4/3] rounded-xl border border-dashed border-line/70 bg-cream/30 flex flex-col items-center justify-center gap-1.5">
          <ImageIcon className="h-6 w-6 text-muted/40" />
          <span className="text-[9px] font-bold text-muted/60 uppercase tracking-wider">Not Uploaded</span>
        </div>
      )}
      <p className="text-[10.5px] font-bold text-muted text-center uppercase tracking-wider">{title}</p>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    Kitchen_Approved:         { label: "Approved",        cls: "bg-success-soft text-success border-success/20" },
    Kitchen_Pending:          { label: "Pending Review",  cls: "bg-primary-soft text-primary border-primary/20" },
    Fssai_Awaiting:           { label: "FSSAI Awaiting",  cls: "bg-amber-100 text-amber-700 border-amber-300" },
    Fssai_Approved:           { label: "FSSAI ✓ Ready",   cls: "bg-blue-50 text-blue-600 border-blue-200" },
    Kitchen_Rejected:         { label: "Rejected",        cls: "bg-red-50 text-error border-red-200" },
    Verified:                 { label: "Active",          cls: "bg-success-soft text-success border-success/20" },
    ACTIVE:                   { label: "Active",          cls: "bg-success-soft text-success border-success/20" },
    REJECTED:                 { label: "Rejected",        cls: "bg-red-50 text-error border-red-200" },
    PENDING_DOCS_APPROVAL:    { label: "Pending Docs",    cls: "bg-primary-soft text-primary border-primary/20" },
    AWAITING_FSSAI_FILING:    { label: "FSSAI Awaiting",  cls: "bg-amber-100 text-amber-700 border-amber-300" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted border-line" };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10.5px] font-display font-bold border backdrop-blur-md", s.cls)}>
      {s.label}
    </span>
  );
}
