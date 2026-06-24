"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { cn, inr } from "@/lib/utils";
import { ArrowLeft, Check, X, FileText, Calendar, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

interface DocumentDetail {
  number: string;
  verified: boolean;
}

interface CookDetails {
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
  rejectionReason?: string;
  capacity?: number;
  cutoffNotice?: string;
  packagingType?: string;
  deliveryMode?: string;
  weeklyOff?: string[];
  address?: string;
  selfieUrl?: string;
  cookingUrl?: string;
  storageUrl?: string;
  sinkUrl?: string;
  aadhaarUrl?: string;
  panUrl?: string;
  meals?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  documents: {
    pan: DocumentDetail;
    aadhaar: DocumentDetail;
    fssai: DocumentDetail;
  };
}

export default function CookDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cook, setCook] = useState<CookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Rejection state
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Toast state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://koala-wok-extruding.ngrok-free.dev";

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const toastId = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4000);
  };

  const fetchCookDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/admin/cooks/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load chef details.");
      }
      setCook(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching chef details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCookDetails();
    }
  }, [id]);

  const handleVerify = async (approve: boolean) => {
    if (!approve && !rejectReason.trim()) {
      showToast("Please provide a reason for rejection.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/cooks/${id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approve,
          reason: approve ? undefined : rejectReason.trim()
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to verify chef application.");
      }

      showToast(approve ? "Chef application approved successfully!" : "Chef application rejected.", approve ? "success" : "info");
      setShowRejectForm(false);
      setRejectReason("");
      
      // Reload details to sync status
      fetchCookDetails();
    } catch (err: any) {
      showToast(err.message || "Failed to submit verification.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCook = async () => {
    if (!confirm("Are you sure you want to delete this kitchen profile? This action cannot be undone.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/cooks/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete cook profile.");
      }
      showToast("Kitchen profile deleted successfully!", "success");
      setTimeout(() => {
        router.push("/cooks");
      }, 1000);
    } catch (err: any) {
      showToast(err.message || "Failed to delete cook.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const initials = (name: string) => {
    return name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-ink-soft font-display font-bold">Loading chef credentials...</p>
      </div>
    );
  }

  if (error || !cook) {
    return (
      <div className="flex-1 p-8 space-y-4 max-w-lg mx-auto text-center">
        <div className="card-padded border border-red-200 bg-red-50/5 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-error mx-auto" />
          <h3 className="font-display font-bold text-ink text-[16px]">Failed to Load Chef Details</h3>
          <p className="text-[13px] text-muted leading-relaxed">{error || "Chef account not found."}</p>
          <Button variant="primary" size="sm" onClick={fetchCookDetails} className="mx-auto">
            Retry loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Topbar
        title="Chef Verification"
        subtitle={`Review application credentials for ${cook.name}`}
      />

      <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-5xl">
        
        {/* Back navigation */}
        <div>
          <Link href="/cooks" className="inline-flex items-center gap-1.5 text-muted hover:text-ink text-[13px] font-display font-bold transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Cooks Dashboard</span>
          </Link>
        </div>

        {/* Profile Header Card */}
        <div className="card-padded bg-white border border-line/60 flex flex-wrap items-center justify-between gap-6">
          <div className="flex gap-4 items-center">
            <div className="h-16 w-16 rounded-3xl bg-primary text-white grid place-items-center text-[18px] font-display font-bold shrink-0 shadow-md">
              {initials(cook.name)}
            </div>
            <div className="space-y-1">
              <h2 className="font-display font-bold text-ink text-[20px] leading-tight">{cook.name}</h2>
              <p className="text-[13px] text-muted flex items-center gap-1.5">
                <span>{cook.phone}</span>
                <span>·</span>
                <span className="font-mono text-[11px] bg-cream px-2 py-0.5 rounded-md text-ink-soft">{cook.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={cn(
              "px-3 py-1 rounded-full text-[11px] font-display font-bold border",
              cook.tier === 1 
                ? "bg-bg text-ink border-line" 
                : "bg-secondary-soft text-secondary border-secondary/15"
            )}>
              Tier {cook.tier}
            </span>
            <StatusChip status={cook.status} />
          </div>
        </div>

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-white border border-line/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-line/45 bg-bg">
                <h3 className="font-display font-bold text-ink text-[14px]">Chef Profile details</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
                <DetailRow label="City Area" value={cook.city || "Unknown"} />
                <DetailRow label="Dietary Preference" value={cook.isVegOnly ? "Veg Only (Pure Veg)" : "Veg & Non-Veg"} />
                <DetailRow label="Date of Birth" value={cook.dob || "Not Provided"} />
                <DetailRow 
                  label="Meals Offered" 
                  value={
                    cook.meals 
                      ? [
                          cook.meals.breakfast && "Breakfast",
                          cook.meals.lunch && "Lunch",
                          cook.meals.dinner && "Dinner"
                        ].filter(Boolean).join(", ") || "None"
                      : "Not Configured"
                  } 
                />
                <DetailRow label="WhatsApp Contact" value={cook.whatsapp || "Not Provided"} />
                <DetailRow label="Alternate Contact" value={cook.altContact || "Not Provided"} />
                <DetailRow label="Daily Capacity" value={cook.capacity ? `${cook.capacity} meals/day` : "Not Configured"} />
                <DetailRow label="Cutoff Notice Period" value={cook.cutoffNotice || "Not Provided"} />
                <DetailRow label="Packaging Type" value={cook.packagingType || "Not Configured"} />
                <DetailRow label="Delivery Mode" value={cook.deliveryMode || "Not Configured"} />
                <DetailRow label="Weekly Off days" value={cook.weeklyOff && cook.weeklyOff.length > 0 ? cook.weeklyOff.join(", ") : "None"} />
                <DetailRow label="Date Joined" value={new Date(cook.appliedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })} />
              </div>
              <div className="p-5 space-y-2 text-[13px] border-t border-line/45 bg-bg/10">
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted font-medium">Physical Address</span>
                  <span className="font-display font-bold text-ink-soft leading-relaxed bg-white p-3.5 rounded-2xl border border-line">
                    {cook.address || "Not Provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents Verification Panel */}
            <div className="card bg-white border border-line/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-line/45 bg-bg">
                <h3 className="font-display font-bold text-ink text-[14px]">Submitted Identity Documents</h3>
              </div>
              <div className="p-5 space-y-4">
                
                {/* Aadhaar */}
                <DocumentCard 
                  title="Aadhaar Card"
                  docNumber={cook.aadhaarNo || "123456789012"}
                  verified={cook.documents.aadhaar.verified}
                  imageUrl={cook.aadhaarUrl}
                />

                {/* PAN */}
                <DocumentCard 
                  title="PAN Card"
                  docNumber={cook.panNo || "ABCDE1234F"}
                  verified={cook.documents.pan.verified}
                  imageUrl={cook.panUrl}
                />

                {/* FSSAI */}
                <DocumentCard 
                  title="FSSAI Registration"
                  docNumber={cook.fssaiNumber ? `${cook.fssaiNumber} (Expires ${cook.fssaiExpiry})` : "Not Filed/Uploaded"}
                  verified={cook.documents.fssai.verified}
                  isFssai={true}
                />

              </div>
            </div>

            {/* Kitchen & Chef Photos Panel */}
            <div className="card bg-white border border-line/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-line/45 bg-bg">
                <h3 className="font-display font-bold text-ink text-[14px]">Submitted Kitchen & Chef Photos</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PhotoCard 
                  title="Chef Selfie"
                  imageUrl={cook.selfieUrl}
                  type="selfie"
                />
                <PhotoCard 
                  title="Cooking Area"
                  imageUrl={cook.cookingUrl}
                  type="cooking"
                />
                <PhotoCard 
                  title="Storage Area"
                  imageUrl={cook.storageUrl}
                  type="storage"
                />
                <PhotoCard 
                  title="Sink / Washing Area"
                  imageUrl={cook.sinkUrl}
                  type="sink"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Verification Actions */}
          <div className="space-y-6">
            
            {/* Rejection Reason display if rejected */}
            {(cook.status === 'REJECTED' || cook.status === 'Kitchen_Rejected') && cook.rejectionReason && (
              <div className="card-padded border border-red-200 bg-red-50/5 space-y-2">
                <h4 className="font-display font-bold text-error text-[13px] flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>Rejection Reason</span>
                </h4>
                <p className="text-[12px] text-muted italic leading-relaxed">&quot;{cook.rejectionReason}&quot;</p>
              </div>
            )}

            {/* Actions Card */}
            {cook.status === 'PENDING_DOCS_APPROVAL' || cook.status === 'Kitchen_Pending' || cook.status === 'Fssai_Approved' ? (
              <div className="card bg-white border border-line/60 overflow-hidden sticky top-6">
                <div className="px-5 py-4 border-b border-line/45 bg-bg flex items-center gap-2 text-ink-soft">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  <h3 className="font-display font-bold text-ink text-[14px]">Verify Chef Application</h3>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-[12.5px] text-muted leading-relaxed">
                    Review all identity document numbers and business settings. Once verified correct, click Approve to set this kitchen Active.
                  </p>

                  {!showRejectForm ? (
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => handleVerify(true)}
                        disabled={actionLoading}
                        className="w-full h-10 rounded-xl font-display font-bold text-[13px] flex items-center justify-center gap-1.5"
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span>Approve Registration</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowRejectForm(true)}
                        disabled={actionLoading}
                        className="w-full h-10 rounded-xl font-display font-bold text-[13px] border border-line hover:border-red-500/25 hover:text-error text-ink-soft"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject Registration</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Rejection Reason</label>
                        <textarea
                          rows={3}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. Address proof mismatch or FSSAI number invalid."
                          className="w-full p-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-red-500 placeholder:text-muted/65 font-sans resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                          disabled={actionLoading}
                          className="flex-1 h-9.5 rounded-xl text-[12px] font-display font-bold border border-line text-muted"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleVerify(false)}
                          disabled={actionLoading}
                          className="flex-1 h-9.5 rounded-xl text-[12px] font-display font-bold bg-error hover:bg-error/95 text-white flex items-center justify-center gap-1"
                        >
                          {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          <span>Confirm Reject</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : cook.status === 'Fssai_Awaiting' || cook.status === 'AWAITING_FSSAI_FILING' ? (
              <div className="card-padded bg-amber-500/5 border border-amber-500/15 text-center space-y-3.5 rounded-2xl">
                <AlertCircle className="h-9 w-9 text-amber-500 mx-auto" />
                <h4 className="font-display font-bold text-amber-800 text-[14px]">FSSAI License Required</h4>
                <p className="text-[12.5px] text-amber-700 leading-relaxed">
                  This chef is currently awaiting FSSAI license filing. You must enter their FSSAI license details on the Cooks Dashboard before you can verify their application documents.
                </p>
              </div>
            ) : (
              <div className="card-padded bg-cream/15 border border-line/45 text-center space-y-2.5">
                <ShieldCheck className="h-9 w-9 text-success mx-auto" />
                <h4 className="font-display font-bold text-ink text-[14px]">Verification Completed</h4>
                <p className="text-[12px] text-muted leading-relaxed">
                  This application has already been processed. The chef&apos;s status is currently listed as **{
                    cook.status === 'Kitchen_Approved' || cook.status === 'ACTIVE' ? 'Active' :
                    cook.status === 'Kitchen_Rejected' || cook.status === 'REJECTED' ? 'Rejected' :
                    cook.status
                  }**.
                </p>
              </div>
            )}

            {/* Danger Zone */}
            <div className="card bg-white border border-red-200/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-red-100 bg-red-50/30 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4.5 w-4.5" />
                <h3 className="font-display font-bold text-red-700 text-[14px]">Danger Zone</h3>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-[12px] text-muted leading-relaxed">
                  Permanently delete this kitchen profile and all associated data. This action cannot be undone.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeleteCook}
                  disabled={actionLoading}
                  className="w-full h-10 rounded-xl font-display font-bold text-[13px] bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  <span>Delete Kitchen Profile</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-2xl border shadow-lift flex items-start gap-3 bg-white/95 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-5",
              toast.type === "success" && "border-success/20 text-ink",
              toast.type === "error" && "border-error/20 text-ink",
              toast.type === "info" && "border-secondary/20 text-ink"
            )}
          >
            {toast.type === "success" && <Check className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" />}
            {toast.type === "error" && <X className="h-4.5 w-4.5 text-error mt-0.5 shrink-0" />}
            {toast.type === "info" && <AlertCircle className="h-4.5 w-4.5 text-secondary mt-0.5 shrink-0" />}
            
            <div className="flex-1 text-[12px] font-medium leading-normal">{toast.message}</div>
            
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted hover:text-ink shrink-0 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2 border-b border-line/25 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
      <span className="text-muted font-medium">{label}</span>
      <span className="font-display font-bold text-ink-soft sm:text-right">{value}</span>
    </div>
  );
}

function DocumentCard({ title, docNumber, verified, imageUrl, isFssai = false }: { title: string; docNumber: string; verified: boolean; imageUrl?: string; isFssai?: boolean }) {
  const [showImage, setShowImage] = useState(false);
  const placeholderUrl = isFssai 
    ? "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop"
    : title.toLowerCase().includes("pan")
      ? "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1557804506-6fd96901440b?w=600&auto=format&fit=crop";

  const imageSrc = imageUrl || placeholderUrl;

  return (
    <div className="p-4 border border-line rounded-2xl bg-surface flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="h-9 w-9 rounded-xl bg-cream/70 text-ink-soft grid place-items-center shrink-0">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-display font-bold text-ink text-[13px]">{title}</h4>
            <p className="font-mono text-ink-soft text-[12.5px] font-bold">{docNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImage(!showImage)}
            className="h-7 px-2.5 rounded-lg border border-line bg-white hover:bg-cream/45 text-[11px] font-display font-bold text-ink-soft cursor-pointer transition-all"
          >
            {showImage ? "Hide View" : "View Doc"}
          </button>
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold border shadow-sm",
            verified 
              ? "bg-success-soft text-success border-success/15" 
              : isFssai
                ? "bg-bg text-ink border-line"
                : "bg-red-500/10 text-error border-red-500/15"
          )}>
            {verified ? "Verified" : isFssai ? "Pending" : "Unverified"}
          </span>
        </div>
      </div>

      {showImage && (
        <div className="mt-2 rounded-xl overflow-hidden border border-line/70 max-h-[220px] bg-bg relative flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
  );
}

function PhotoCard({ title, imageUrl, type }: { title: string; imageUrl?: string; type: string }) {
  const [showImage, setShowImage] = useState(false);
  const placeholderMap: Record<string, string> = {
    selfie: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop",
    cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop",
    storage: "https://images.unsplash.com/photo-1595348020949-87cdfda44f74?w=600&auto=format&fit=crop",
    sink: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop"
  };

  const imageSrc = imageUrl || placeholderMap[type] || placeholderMap.cooking;

  return (
    <div className="p-4 border border-line rounded-2xl bg-surface flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-display font-bold text-ink text-[13px]">{title}</h4>
        <button
          type="button"
          onClick={() => setShowImage(!showImage)}
          className="h-7 px-2.5 rounded-lg border border-line bg-white hover:bg-cream/45 text-[11px] font-display font-bold text-ink-soft cursor-pointer transition-all"
        >
          {showImage ? "Hide View" : "View Photo"}
        </button>
      </div>

      {showImage && (
        <div className="mt-2 rounded-xl overflow-hidden border border-line/70 h-[180px] bg-bg relative flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Active", cls: "bg-success-soft text-success" },
    PENDING_DOCS_APPROVAL: { label: "Pending Docs", cls: "bg-primary-soft text-primary" },
    AWAITING_FSSAI_FILING: { label: "Awaiting Filing", cls: "bg-red-500/10 text-error border border-red-500/20" },
    NEW: { label: "New", cls: "bg-blue-50 text-blue-600 border border-blue-100" },
    REJECTED: { label: "Rejected", cls: "bg-red-500/10 text-error border border-red-500/15" },
    
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
