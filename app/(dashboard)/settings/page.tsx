"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Bell,
  Building2,
  KeyRound,
  LogOut,
  Percent,
  Shield,
  Wallet,
  Globe,
  FileText,
  AlertCircle,
  Check,
  MapPin,
} from "lucide-react";

export default function SettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states for individual fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://koala-wok-extruding.ngrok-free.dev";

  // Fetch current config
  const fetchConfig = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/config`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch configurations");
      }
      setConfig(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred loading configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Update a single configuration field
  const handleSaveField = async (fieldName: string, rawValue: string) => {
    setError("");
    setSuccess("");
    
    // Construct payload dynamically based on the field being edited
    let payloadValue: any = rawValue;
    
    // Numeric type conversions
    if ([
      "platformCommission", 
      "customerDeliveryFee", 
      "cookSignupBonus", 
      "minimumPayout", 
      "platformFee",
      "defaultStateRadius",
      "defaultCityRadius",
      "defaultVillageRadius"
    ].includes(fieldName)) {
      const num = Number(rawValue);
      if (isNaN(num) || num < 0) {
        setError("Please enter a valid non-negative number.");
        return;
      }
      if (fieldName === "platformCommission" && num > 100) {
        setError("Commission cannot exceed 100%.");
        return;
      }
      payloadValue = num;
    }

    try {
      const res = await fetch(`${apiUrl}/api/admin/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [fieldName]: payloadValue }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save configuration.");
      }
      setConfig(data.data);
      setSuccess("Configuration updated successfully!");
      setEditingField(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update configuration.");
    }
  };

  const startEditing = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setEditValue(String(currentValue));
  };

  if (loading && !config) {
    return (
      <>
        <Topbar title="Settings" subtitle="Platform config + admin controls" />
        <div className="flex-1 p-6 lg:p-8 max-w-4xl space-y-8 animate-pulse">
          <div className="h-48 w-full bg-cream/30 border border-line rounded-2xl" />
          <div className="h-48 w-full bg-cream/30 border border-line rounded-2xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Settings" subtitle="Platform config + admin controls" />
      <div className="flex-1 p-6 lg:p-8 max-w-4xl space-y-7">
        
        {/* Status notifications */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[13px] font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[13px] font-medium flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Commission & Fees */}
        <Section kicker="MARKETPLACE" title="Commission & fees">
          <EditableField
            label="Platform commission"
            fieldName="platformCommission"
            value={config ? `${config.platformCommission}%` : "15%"}
            icon={Percent}
            hint="Charged on cook gross — applied at payout time."
            editing={editingField === "platformCommission"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("platformCommission", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("platformCommission", config?.platformCommission)}
          />
          <EditableField
            label="Customer delivery fee"
            fieldName="customerDeliveryFee"
            value={config ? `₹${config.customerDeliveryFee}` : "₹25"}
            icon={Wallet}
            hint="Free for orders ₹199+ via FREEDEL coupon."
            editing={editingField === "customerDeliveryFee"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("customerDeliveryFee", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("customerDeliveryFee", config?.customerDeliveryFee)}
          />
          <EditableField
            label="Cook signup bonus"
            fieldName="cookSignupBonus"
            value={config ? `₹${config.cookSignupBonus}` : "₹500"}
            icon={Wallet}
            hint="One-time, paid out after first 5 delivered orders."
            editing={editingField === "cookSignupBonus"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("cookSignupBonus", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("cookSignupBonus", config?.cookSignupBonus)}
          />
          <EditableField
            label="Flat platform fee"
            fieldName="platformFee"
            value={config ? `₹${config.platformFee}` : "₹10"}
            icon={Wallet}
            hint="Fixed platform transaction fee charged to customers per order."
            editing={editingField === "platformFee"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("platformFee", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("platformFee", config?.platformFee)}
          />
        </Section>

        {/* Legal & Policy URLs */}
        <Section kicker="LEGAL & POLICIES" title="Configuration URLs">
          <EditableField
            label="Privacy Policy URL"
            fieldName="privacyPolicyUrl"
            value={config?.privacyPolicyUrl || "https://example.com/privacy"}
            icon={Globe}
            hint="Used in frontend and partner onboarding screens."
            editing={editingField === "privacyPolicyUrl"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("privacyPolicyUrl", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("privacyPolicyUrl", config?.privacyPolicyUrl)}
          />
          <EditableField
            label="Terms & Conditions URL"
            fieldName="termsAndConditionUrl"
            value={config?.termsAndConditionUrl || "https://example.com/terms"}
            icon={FileText}
            hint="Mandatory terms display for partners and customers."
            editing={editingField === "termsAndConditionUrl"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("termsAndConditionUrl", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("termsAndConditionUrl", config?.termsAndConditionUrl)}
          />
        </Section>

        {/* Default Service Radii */}
        <Section kicker="SERVICE BOUNDARIES" title="Default service radii">
          <EditableField
            label="Default State Radius"
            fieldName="defaultStateRadius"
            value={config ? `${config.defaultStateRadius / 1000} km` : "100 km"}
            icon={Globe}
            hint="Default radius applied when adding a State to active service regions (enter in km)."
            editing={editingField === "defaultStateRadius"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("defaultStateRadius", String(Number(editValue) * 1000))}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("defaultStateRadius", config ? config.defaultStateRadius / 1000 : 100)}
          />
          <EditableField
            label="Default City Radius"
            fieldName="defaultCityRadius"
            value={config ? `${config.defaultCityRadius / 1000} km` : "15 km"}
            icon={Building2}
            hint="Default radius applied when adding a City to active service regions (enter in km)."
            editing={editingField === "defaultCityRadius"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("defaultCityRadius", String(Number(editValue) * 1000))}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("defaultCityRadius", config ? config.defaultCityRadius / 1000 : 15)}
          />
          <EditableField
            label="Default Village Radius"
            fieldName="defaultVillageRadius"
            value={config ? `${config.defaultVillageRadius / 1000} km` : "5 km"}
            icon={MapPin}
            hint="Default radius applied when adding a Village to active service regions (enter in km)."
            editing={editingField === "defaultVillageRadius"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("defaultVillageRadius", String(Number(editValue) * 1000))}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("defaultVillageRadius", config ? config.defaultVillageRadius / 1000 : 5)}
          />
        </Section>

        {/* Payouts */}
        <Section kicker="PAYOUTS" title="Payout cycle">
          <EditableField
            label="Cycle"
            fieldName="payoutCycle"
            value={config?.payoutCycle || "Weekly · Friday 6 PM IST"}
            icon={Wallet}
            editing={editingField === "payoutCycle"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("payoutCycle", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("payoutCycle", config?.payoutCycle)}
          />
          <EditableField
            label="Minimum payout"
            fieldName="minimumPayout"
            value={config ? `₹${config.minimumPayout}` : "₹500"}
            icon={Wallet}
            editing={editingField === "minimumPayout"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("minimumPayout", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("minimumPayout", config?.minimumPayout)}
          />
          <EditableField
            label="Bank rail"
            fieldName="bankRail"
            value={config?.bankRail || "UPI · NEFT fallback"}
            icon={Building2}
            editing={editingField === "bankRail"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={() => handleSaveField("bankRail", editValue)}
            onCancel={() => setEditingField(null)}
            onEdit={() => startEditing("bankRail", config?.bankRail)}
          />
        </Section>

        {/* Notifications */}
        <Section kicker="NOTIFICATIONS" title="System alerts">
          <Toggle label="Order escalations" sub="Alert admins when an order is unaccepted for >5 min" defaultOn />
          <Toggle label="Refund requests" sub="Slack me when a customer requests a refund" defaultOn />
          <Toggle label="New cook signups" sub="Email when a new kitchen submits FSSAI" defaultOn={false} />
          <Toggle label="Weekly digest" sub="Friday recap of GMV, NPS, top kitchens" defaultOn />
        </Section>

        {/* Security */}
        <Section kicker="SECURITY" title="Access & sign-in">
          <RowAction icon={KeyRound} title="Change password" sub="Last changed 2 months ago" cta="Change" />
          <RowAction icon={Shield} title="Two-factor auth" sub="SMS · enabled" cta="Manage" />
          <RowAction icon={Bell} title="Trusted devices" sub="3 devices currently signed in" cta="Review" />
        </Section>

        {/* Danger zone */}
        <div className="rounded-2xl border border-error/30 bg-[#FFF7F7] p-5">
          <p className="kicker text-error">DANGER ZONE</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <p className="font-display font-bold text-ink">Sign out of admin</p>
              <p className="text-[12.5px] text-ink-soft mt-1">
                Ends this session on this browser. Your settings stay saved.
              </p>
            </div>
            <a
              href="/login"
              className="h-9 px-4 rounded-xl bg-error text-white font-display font-bold text-[12.5px] inline-flex items-center gap-1.5 hover:opacity-90 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="kicker">{kicker}</p>
      <p className="h2-display mt-1">{title}</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </section>
  );
}

interface EditableFieldProps {
  label: string;
  fieldName: string;
  value: string;
  icon: typeof Wallet;
  hint?: string;
  editing: boolean;
  editValue: string;
  setEditValue: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

function EditableField({
  label,
  value,
  icon: Icon,
  hint,
  editing,
  editValue,
  setEditValue,
  onSave,
  onCancel,
  onEdit,
}: EditableFieldProps) {
  return (
    <div className="p-5 flex items-start gap-4 bg-white border border-line rounded-[20px] shadow-sm hover:bg-cream/10 transition-all">
      <div className="h-10 w-10 rounded-xl bg-cream grid place-items-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-ink-soft" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-ink text-[13.5px]">{label}</p>
        
        {editing ? (
          <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-9 px-3 bg-surface border border-line rounded-lg text-[13px] outline-none focus:border-primary flex-1"
            />
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" onClick={onSave} className="h-9">Save</Button>
              <button
                onClick={onCancel}
                className="h-9 px-3 text-[12px] font-display font-bold border border-line rounded-lg hover:bg-cream bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          hint && <p className="text-[12px] text-muted mt-1 leading-relaxed">{hint}</p>
        )}
      </div>
      
      {!editing && (
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-primary text-[13.5px]">{value}</p>
          <button
            onClick={onEdit}
            className="text-[11.5px] text-ink-soft hover:text-primary font-display font-bold hover:underline mt-1 block w-full text-right"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, sub, defaultOn }: { label: string; sub: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="p-5 flex items-start gap-4 bg-white border border-line rounded-[20px] shadow-sm hover:bg-cream/10 transition-all">
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-ink text-[13.5px]">{label}</p>
        <p className="text-[12px] text-muted mt-1 leading-relaxed">{sub}</p>
      </div>
      <button onClick={() => setOn(!on)} className="focus:outline-none mt-0.5">
        <span
          className={cn(
            "relative inline-block h-6 w-11 rounded-full transition-colors shrink-0",
            on ? "bg-primary" : "bg-line",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform",
              on ? "translate-x-5" : "translate-x-0",
            )}
          />
        </span>
      </button>
    </div>
  );
}

function RowAction({
  icon: Icon,
  title,
  sub,
  cta,
}: {
  icon: typeof Wallet;
  title: string;
  sub: string;
  cta: string;
}) {
  return (
    <div className="p-5 flex items-center gap-4 bg-white border border-line rounded-[20px] shadow-sm hover:bg-cream/10 transition-all">
      <div className="h-10 w-10 rounded-xl bg-cream grid place-items-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-ink-soft" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-ink text-[13.5px]">{title}</p>
        <p className="text-[12px] text-muted mt-0.5">{sub}</p>
      </div>
      <button className="h-9 px-4 rounded-xl bg-cream text-ink font-display font-bold text-[12px] hover:bg-cream/70 shrink-0">
        {cta}
      </button>
    </div>
  );
}
