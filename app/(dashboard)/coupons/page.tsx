"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { cn, shortDate } from "@/lib/utils";
import { Plus, Search, X, Check, AlertCircle, Calendar, Ticket, Loader2, Edit2, Trash2 } from "lucide-react";

interface Coupon {
  code: string;
  description: string;
  type: "flat" | "percent" | "free_delivery";
  value: number;
  redemptions: number;
  cap: number;
  status: "active" | "scheduled" | "expired" | "inactive";
  endsAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "scheduled" | "expired" | "inactive">("active");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "scheduled" | "expired" | "inactive">("all");

  // Modal State
  const [showModal, setShowModal] = useState(false);

  // New Coupon Form States
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"flat" | "percent" | "free_delivery">("flat");
  const [newValue, setNewValue] = useState("50");
  const [newCap, setNewCap] = useState("1000");
  const [newEndsAt, setNewEndsAt] = useState("");

  // Toast State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://koala-wok-extruding.ngrok-free.dev";

  // Helper to show toasts
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Coupons from API
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams();
      if (searchQuery.trim()) {
        qParams.append("q", searchQuery.trim());
      }
      if (statusFilter !== "all") {
        qParams.append("status", statusFilter);
      }

      const res = await fetch(`${apiUrl}/api/admin/coupons?${qParams.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load coupons");
      }
      setCoupons(data.data || []);
    } catch (err: any) {
      showToast(err.message || "An error occurred loading coupons.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when search or tab filters change (debounced search handled by useEffect)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCoupons();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter]);

  const executeDeleteCoupon = async (code: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/coupons/${code}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete coupon.");
      }
      showToast(data.message || `Coupon "${code}" deleted successfully!`, "success");
      fetchCoupons();
    } catch (err: any) {
      showToast(err.message || "An error occurred deleting coupon.", "error");
    }
  };

  const resetForm = () => {
    setNewCode("");
    setNewDescription("");
    setNewType("flat");
    setNewValue("50");
    setNewCap("1000");
    setNewEndsAt("");
    setNewStatus("active");
    setEditingCoupon(null);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCode(coupon.code);
    setNewDescription(coupon.description);
    setNewType(coupon.type);
    setNewValue(String(coupon.value));
    setNewCap(String(coupon.cap));
    setNewEndsAt(coupon.endsAt.split("T")[0]);
    setNewStatus(coupon.status);
    setShowModal(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDescription.trim()) {
      showToast("Coupon description is required.", "error");
      return;
    }
    if (!newEndsAt) {
      showToast("Expiration date is required.", "error");
      return;
    }

    const valueNum = newType === "free_delivery" ? 0 : Number(newValue);
    if (newType !== "free_delivery" && (isNaN(valueNum) || valueNum < 0)) {
      showToast("Please enter a valid discount value.", "error");
      return;
    }

    const capNum = Number(newCap);
    if (isNaN(capNum) || capNum <= 0) {
      showToast("Please enter a valid redemptions limit (cap).", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCoupon) {
        const res = await fetch(`${apiUrl}/api/admin/coupons/${editingCoupon.code}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: newDescription.trim(),
            type: newType,
            value: valueNum,
            cap: capNum,
            endsAt: new Date(newEndsAt).toISOString(),
            status: newStatus,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to update coupon.");
        }

        showToast(`Coupon "${editingCoupon.code}" updated successfully!`, "success");
        resetForm();
        setShowModal(false);
        fetchCoupons();
      } else {
        if (!newCode.trim()) {
          showToast("Coupon code is required.", "error");
          setSubmitting(false);
          return;
        }

        const res = await fetch(`${apiUrl}/api/admin/coupons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: newCode.trim().toUpperCase(),
            description: newDescription.trim(),
            type: newType,
            value: valueNum,
            cap: capNum,
            endsAt: new Date(newEndsAt).toISOString(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to create coupon.");
        }

        showToast(`Coupon "${data.data.code}" created successfully!`, "success");
        resetForm();
        setShowModal(false);
        fetchCoupons();
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar
        title="Coupons"
        subtitle={`${coupons.filter((c) => c.status === "active").length} active · ${coupons.length} total`}
      />

      <div className="flex-1 p-6 lg:p-8 space-y-6">
        
        {/* Toolbar */}
        <div className="card-padded flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-cream flex-1 min-w-[240px] border border-line/45">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code or description…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {[
              { val: "all", label: "All" },
              { val: "active", label: "Active" },
              { val: "scheduled", label: "Scheduled" },
              { val: "expired", label: "Expired" },
              { val: "inactive", label: "Inactive" }
            ].map((t) => (
              <button
                key={t.val}
                type="button"
                onClick={() => setStatusFilter(t.val as any)}
                className={cn(
                  "h-9 px-3.5 rounded-full text-[12px] font-display font-bold border transition-all",
                  statusFilter === t.val
                    ? "bg-ink text-white border-ink shadow-sm"
                    : "bg-surface text-ink-soft border-line hover:border-ink/30"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            leadingIcon={<Plus className="h-4 w-4" />}
            className="h-10 px-4 rounded-xl whitespace-nowrap shrink-0"
          >
            New coupon
          </Button>
        </div>

        {/* Coupons Listing */}
        {loading && coupons.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card h-56 animate-pulse bg-cream/25 border border-line" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-line rounded-[24px] p-8 bg-white w-full flex flex-col items-center justify-center min-h-[350px]">
            <div className="h-14 w-14 rounded-full bg-cream grid place-items-center mb-4">
              <Ticket className="h-6 w-6 text-muted" />
            </div>
            <p className="font-display font-bold text-ink text-[16px]">No coupons found</p>
            <p className="text-[13px] text-muted mt-1.5 max-w-sm leading-relaxed">
              Create discount coupons, flat rates, or free delivery codes to incentivize your customers.
            </p>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setShowModal(true)}
              leadingIcon={<Plus className="h-4.5 w-4.5" />}
              className="mt-6 shadow-md hover:shadow-lg transition-all"
            >
              Create first coupon
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {coupons.map((c) => {
              const pct = Math.min(100, Math.round((c.redemptions / c.cap) * 100));
              return (
                <div key={c.code} className="card overflow-hidden hover:shadow-card transition-all duration-200 border border-line/60">
                  {/* Ticket Header styled dynamically */}
                  <div className={cn(
                    "p-5 text-white relative bg-gradient-to-br",
                    (c.status === "expired" || c.status === "inactive") 
                      ? "from-muted/70 to-muted" 
                      : c.status === "scheduled" 
                        ? "from-secondary to-[#4A90E2]" 
                        : "from-primary to-[#FF8A65]"
                  )}>
                    <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/12" />
                    
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-display font-bold">
                      {c.type === "flat" ? "FLAT DISCOUNT" : c.type === "percent" ? "PERCENT OFF" : "FREE DELIVERY"}
                    </p>
                    <p className="font-display font-bold text-[32px] tracking-[-0.02em] mt-1.5 leading-none">
                      {c.code}
                    </p>
                    <p className="text-white/85 text-[12px] mt-2.5 max-w-[26ch] min-h-[36px] line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="p-4 space-y-3.5 bg-white">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted">Redemptions</span>
                      <span className="font-display font-bold text-ink">
                        {c.redemptions.toLocaleString("en-IN")} / {c.cap.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-cream overflow-hidden">
                      <div className={cn(
                        "h-full transition-all",
                        (c.status === "expired" || c.status === "inactive") ? "bg-muted" : c.status === "scheduled" ? "bg-secondary" : "bg-primary"
                      )} style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-line/30">
                      <span className="text-[11px] text-muted flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Ends {shortDate(new Date(c.endsAt))}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1 rounded-md hover:bg-cream/70 text-muted hover:text-ink transition-colors flex items-center justify-center border border-transparent hover:border-line/40"
                          title="Edit Coupon"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCode(c.code)}
                          className="p-1 rounded-md hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors flex items-center justify-center border border-transparent hover:border-red-500/20"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <StatusChip status={c.status} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-line rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(22,24,29,0.18)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-line flex items-center justify-between bg-bg">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold text-ink text-[16px]">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="h-8 w-8 rounded-lg hover:bg-cream/40 flex items-center justify-center text-muted hover:text-ink transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Coupon Code</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCoupon}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH30"
                  className="w-full h-10 px-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-primary font-display font-bold placeholder:text-muted/65 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-cream/10"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. 30% off dinner orders 8-11 PM"
                  className="w-full h-10 px-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-primary placeholder:text-muted/65"
                />
              </div>

              {/* Grid: Type & Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Discount Type</label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setNewType(t);
                      if (t === "free_delivery") {
                        setNewValue("0");
                      }
                    }}
                    className="w-full h-10 px-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-primary"
                  >
                    <option value="flat">Flat Discount (₹)</option>
                    <option value="percent">Percentage Off (%)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">
                    Discount Value {newType === "percent" ? "(%)" : newType === "flat" ? "(₹)" : ""}
                  </label>
                  <input
                    type="number"
                    required
                    disabled={newType === "free_delivery"}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. 30"
                    min="0"
                    className="w-full h-10 px-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-primary disabled:bg-cream/35 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Grid: Cap & Expiration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Usage Cap (Redemptions)</label>
                  <input
                    type="number"
                    required
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                    placeholder="e.g. 5000"
                    min="1"
                    className="w-full h-10 px-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={newEndsAt}
                    onChange={(e) => setNewEndsAt(e.target.value)}
                    className="w-full h-10 px-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Status Select (Visible only when editing) */}
              {editingCoupon && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">Coupon Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full h-10 px-3 bg-surface border border-line rounded-xl text-[13px] outline-none focus:border-primary font-display font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t border-line/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 rounded-xl h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="flex-1 rounded-xl h-10"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingCoupon ? "Saving..." : "Creating..."}
                    </span>
                  ) : (
                    editingCoupon ? "Save Changes" : "Create Coupon"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deletingCode && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-line rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(22,24,29,0.18)] p-6 space-y-5 text-center">
            <div className="h-14 w-14 rounded-full bg-error/10 grid place-items-center mx-auto">
              <AlertCircle className="h-7 w-7 text-error" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-ink text-[16px]">Delete Coupon?</h3>
              <p className="text-[12.5px] text-muted leading-relaxed">
                Are you sure you want to delete coupon <span className="font-bold text-ink">"{deletingCode}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeletingCode(null)}
                className="flex-1 rounded-xl h-10 text-[12.5px]"
              >
                No, cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={async () => {
                  const code = deletingCode;
                  setDeletingCode(null);
                  await executeDeleteCoupon(code);
                }}
                className="flex-1 rounded-xl h-10 text-[12.5px]"
              >
                Yes, delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-2xl border shadow-lift flex items-start gap-3 bg-white/95 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-top-5",
              toast.type === "success" && "border-success/20 text-ink",
              toast.type === "error" && "border-error/20 text-ink",
              toast.type === "info" && "border-secondary/20 text-ink"
            )}
          >
            {toast.type === "success" && <Check className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="h-4.5 w-4.5 text-error mt-0.5 shrink-0" />}
            {toast.type === "info" && <Ticket className="h-4.5 w-4.5 text-secondary mt-0.5 shrink-0" />}
            
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

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: "Active",    cls: "bg-success-soft text-success" },
    scheduled: { label: "Scheduled", cls: "bg-secondary-soft text-secondary" },
    expired:   { label: "Expired",   cls: "bg-cream text-muted" },
    inactive:  { label: "Inactive",  cls: "bg-red-500/10 text-red-500" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}
