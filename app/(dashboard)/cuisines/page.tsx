"use client";

import { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Loader2,
  UtensilsCrossed,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Cuisine {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

type FormData = {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  imageUrl: "",
  isActive: true,
  sortOrder: "0",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CuisinesPage() {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCuisine, setEditingCuisine] = useState<Cuisine | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Cuisine | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"sortOrder" | "name" | "createdAt">("sortOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Form
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" }[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.207.196.137";

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  // ─── Fetch ───────────────────────────────────────────────────────────────

  const fetchCuisines = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/cuisines`, {
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load cuisines");
      setCuisines(data.data || []);
    } catch (err: any) {
      showToast(err.message || "Error loading cuisines", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuisines();
  }, []);

  // ─── Derived filtered list ────────────────────────────────────────────────

  const filtered = cuisines
    .filter((c) => {
      if (filterActive === "active" && !c.isActive) return false;
      if (filterActive === "inactive" && c.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "sortOrder") cmp = a.sortOrder - b.sortOrder;
      else if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

  // ─── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingCuisine(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
    setTimeout(() => nameInputRef.current?.focus(), 80);
  };

  const openEdit = (c: Cuisine) => {
    setEditingCuisine(c);
    setForm({
      name: c.name,
      description: c.description || "",
      imageUrl: c.imageUrl || "",
      isActive: c.isActive,
      sortOrder: String(c.sortOrder),
    });
    setFormError("");
    setShowModal(true);
    setTimeout(() => nameInputRef.current?.focus(), 80);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCuisine(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Cuisine name is required"); return; }
    setFormError("");
    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      isActive: form.isActive,
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    try {
      const method = editingCuisine ? "PUT" : "POST";
      const url = editingCuisine
        ? `${apiUrl}/api/admin/cuisines/${editingCuisine.id}`
        : `${apiUrl}/api/admin/cuisines`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Operation failed");

      showToast(editingCuisine ? `"${payload.name}" updated` : `"${payload.name}" created`);
      closeModal();
      await fetchCuisines();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (c: Cuisine) => {
    setDeletingId(c.id);
    setShowDeleteConfirm(null);
    try {
      const res = await fetch(`${apiUrl}/api/admin/cuisines/${c.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      showToast(`"${c.name}" deleted`);
      await fetchCuisines();
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Quick toggle active ──────────────────────────────────────────────────

  const toggleActive = async (c: Cuisine) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/cuisines/${c.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast(`"${c.name}" ${!c.isActive ? "activated" : "deactivated"}`);
      setCuisines((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
    } catch (err: any) {
      showToast(err.message || "Toggle failed", "error");
    }
  };

  // ─── Sort header helper ───────────────────────────────────────────────────

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col
      ? sortDir === "asc"
        ? <ChevronUp className="h-3 w-3 ml-0.5 text-primary" />
        : <ChevronDown className="h-3 w-3 ml-0.5 text-primary" />
      : <ChevronUp className="h-3 w-3 ml-0.5 text-muted/40" />;

  // ─── Counts ───────────────────────────────────────────────────────────────

  const activeCount = cuisines.filter((c) => c.isActive).length;
  const inactiveCount = cuisines.filter((c) => !c.isActive).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Cuisines" subtitle="Manage the cuisine catalogue served across the platform" />

      <div className="flex-1 px-6 lg:px-8 py-7 space-y-6">

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: cuisines.length, color: "bg-secondary-soft text-secondary" },
            { label: "Active", value: activeCount, color: "bg-success-soft text-success" },
            { label: "Inactive", value: inactiveCount, color: "bg-primary-soft text-primary" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-padded flex items-center gap-4">
              <div className={cn("h-11 w-11 rounded-xl grid place-items-center", color)}>
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-ink">{value}</p>
                <p className="text-[12px] text-muted">{label} Cuisines</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-surface border border-line min-w-[220px]">
              <Search className="h-4 w-4 text-muted shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cuisines…"
                className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-muted"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3.5 w-3.5 text-muted hover:text-ink" />
                </button>
              )}
            </div>

            {/* Active filter pills */}
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterActive(f)}
                className={cn(
                  "h-10 px-3.5 rounded-xl text-[13px] font-display font-semibold capitalize transition-colors border",
                  filterActive === f
                    ? "bg-ink text-white border-ink"
                    : "bg-surface border-line text-ink-soft hover:border-ink/30"
                )}
              >
                {f === "all" ? "All" : f === "active" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          <Button onClick={openCreate} leadingIcon={<Plus className="h-4 w-4" />} size="md">
            Add Cuisine
          </Button>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div className="card overflow-hidden">
          {/* table header */}
          <div className="hidden md:grid grid-cols-[2fr_3fr_80px_80px_110px] gap-4 px-5 py-3 border-b border-line bg-cream/60">
            {[
              { label: "Cuisine", col: "name" as const },
              { label: "Description", col: null },
              { label: "Order", col: "sortOrder" as const },
              { label: "Status", col: null },
              { label: "Actions", col: null },
            ].map(({ label, col }) => (
              <button
                key={label}
                onClick={col ? () => handleSort(col) : undefined}
                className={cn(
                  "flex items-center text-left kicker",
                  col ? "cursor-pointer hover:text-ink transition-colors" : "cursor-default"
                )}
              >
                {label}
                {col && <SortIcon col={col} />}
              </button>
            ))}
          </div>

          {/* rows */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading cuisines…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-cream grid place-items-center">
                <UtensilsCrossed className="h-7 w-7 text-muted" />
              </div>
              <p className="text-[15px] font-display font-semibold text-ink">No cuisines found</p>
              <p className="text-[13px] text-muted max-w-xs">
                {searchQuery ? `No results for "${searchQuery}"` : "Add your first cuisine to get started."}
              </p>
              {!searchQuery && (
                <Button onClick={openCreate} leadingIcon={<Plus className="h-4 w-4" />} size="sm">
                  Add Cuisine
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-line">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_3fr_80px_80px_110px] gap-3 md:gap-4 px-5 py-4 items-center hover:bg-cream/40 transition-colors group"
                >
                  {/* Name + image */}
                  <div className="flex items-center gap-3 min-w-0">
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-10 w-10 rounded-xl object-cover border border-line shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-primary-soft grid place-items-center shrink-0">
                        <UtensilsCrossed className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[14px] font-display font-semibold text-ink truncate">{c.name}</p>
                      <p className="text-[11px] text-muted md:hidden truncate">{c.description || "—"}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="hidden md:block text-[13px] text-ink-soft truncate">
                    {c.description || <span className="text-muted">—</span>}
                  </p>

                  {/* Sort order */}
                  <span className="hidden md:flex items-center justify-center h-7 w-10 rounded-lg bg-cream text-[12px] font-display font-bold text-ink-soft">
                    {c.sortOrder}
                  </span>

                  {/* Active toggle */}
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleActive(c)}
                      title={c.isActive ? "Deactivate" : "Activate"}
                      className="transition-transform hover:scale-110"
                    >
                      {c.isActive ? (
                        <ToggleRight className="h-7 w-7 text-success" strokeWidth={1.8} />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-muted" strokeWidth={1.8} />
                      )}
                    </button>
                    <span className={cn("ml-1.5 text-[11px] font-display font-bold hidden lg:inline", c.isActive ? "text-success" : "text-muted")}>
                      {c.isActive ? "Active" : "Off"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="h-8 w-8 rounded-lg border border-line bg-surface hover:border-secondary hover:bg-secondary-soft text-ink-soft hover:text-secondary transition-colors grid place-items-center"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(c)}
                      disabled={deletingId === c.id}
                      className="h-8 w-8 rounded-lg border border-line bg-surface hover:border-error hover:bg-red-50 text-ink-soft hover:text-error transition-colors grid place-items-center disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-line bg-cream/40">
              <p className="text-[12px] text-muted">
                Showing <span className="font-semibold text-ink">{filtered.length}</span> of{" "}
                <span className="font-semibold text-ink">{cuisines.length}</span> cuisines
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-lift border border-line overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-line">
              <div>
                <h2 className="font-display font-bold text-[17px] text-ink">
                  {editingCuisine ? "Edit Cuisine" : "New Cuisine"}
                </h2>
                <p className="text-[12px] text-muted mt-0.5">
                  {editingCuisine ? `Editing "${editingCuisine.name}"` : "Add a new cuisine to the platform"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="h-9 w-9 rounded-xl border border-line bg-cream grid place-items-center hover:border-ink/30 transition-colors"
              >
                <X className="h-4 w-4 text-ink-soft" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="kicker mb-1.5 block">Cuisine Name *</label>
                <input
                  ref={nameInputRef}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. North Indian, Chinese, Italian"
                  className="w-full h-11 px-3.5 rounded-xl border border-line bg-bg text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted"
                />
              </div>

              {/* Description */}
              <div>
                <label className="kicker mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this cuisine style…"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-bg text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="kicker mb-1.5 block">Image URL</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-xl border border-line bg-bg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <ImageIcon className="h-4 w-4 text-muted shrink-0" />
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://example.com/cuisine.jpg"
                      className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted"
                    />
                  </div>
                  {form.imageUrl && (
                    <img
                      src={form.imageUrl}
                      alt="preview"
                      className="h-11 w-11 rounded-xl object-cover border border-line shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                    />
                  )}
                </div>
              </div>

              {/* Sort order + Active row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="kicker mb-1.5 block">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl border border-line bg-bg text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="kicker mb-1.5 block">Status</label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className={cn(
                      "w-full h-11 px-3.5 rounded-xl border text-[13px] font-display font-semibold flex items-center gap-2 transition-all",
                      form.isActive
                        ? "border-success/30 bg-success-soft text-success"
                        : "border-line bg-cream text-muted"
                    )}
                  >
                    {form.isActive ? (
                      <ToggleRight className="h-5 w-5 shrink-0" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 shrink-0" />
                    )}
                    {form.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-error/20 text-error text-[13px]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={submitting}
                  leadingIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {submitting ? "Saving…" : editingCuisine ? "Save Changes" : "Create Cuisine"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-lift border border-line p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="h-12 w-12 rounded-2xl bg-red-50 grid place-items-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-error" />
            </div>
            <h3 className="font-display font-bold text-[17px] text-ink text-center">Delete Cuisine?</h3>
            <p className="text-[13px] text-muted text-center mt-1.5">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-ink">"{showDeleteConfirm.name}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notifications ───────────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lift text-[13px] font-medium pointer-events-auto",
              t.type === "success"
                ? "bg-ink text-white"
                : "bg-error text-white"
            )}
          >
            {t.type === "success" ? (
              <UtensilsCrossed className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
