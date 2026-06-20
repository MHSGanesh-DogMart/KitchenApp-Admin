import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";
import {
  Bell,
  Building2,
  KeyRound,
  LogOut,
  Percent,
  Shield,
  Wallet,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" subtitle="Platform config + admin controls" />
      <div className="flex-1 p-6 lg:p-8 max-w-4xl space-y-7">
        {/* Commission */}
        <Section kicker="MARKETPLACE" title="Commission & fees">
          <Field label="Platform commission" value="15%" icon={Percent} hint="Charged on cook gross — applied at payout time." />
          <Field label="Customer delivery fee" value="₹25" icon={Wallet} hint="Free for orders ₹199+ via FREEDEL coupon." />
          <Field label="Cook signup bonus" value="₹500" icon={Wallet} hint="One-time, paid out after first 5 delivered orders." />
        </Section>

        {/* Payouts */}
        <Section kicker="PAYOUTS" title="Payout cycle">
          <Field label="Cycle" value="Weekly · Friday 6 PM IST" icon={Wallet} />
          <Field label="Minimum payout" value="₹500" icon={Wallet} />
          <Field label="Bank rail" value="UPI · NEFT fallback" icon={Building2} />
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
      <div className="mt-4 card divide-y divide-line">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  hint?: string;
}) {
  return (
    <div className="p-5 flex items-start gap-4 hover:bg-cream/30 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-cream grid place-items-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-ink-soft" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-ink text-[13.5px]">{label}</p>
        {hint && <p className="text-[12px] text-muted mt-1 leading-relaxed">{hint}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="font-display font-bold text-ink text-[13.5px]">{value}</p>
        <button className="text-[11.5px] text-primary font-display font-bold hover:underline mt-1">
          Edit
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, sub, defaultOn }: { label: string; sub: string; defaultOn: boolean }) {
  return (
    <div className="p-5 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-ink text-[13.5px]">{label}</p>
        <p className="text-[12px] text-muted mt-1">{sub}</p>
      </div>
      <PillSwitch defaultOn={defaultOn} />
    </div>
  );
}

function PillSwitch({ defaultOn }: { defaultOn: boolean }) {
  // SSR-safe presentational toggle. Wire to state once persisted.
  return (
    <span
      className={cn(
        "relative inline-block h-7 w-12 rounded-full transition-colors shrink-0",
        defaultOn ? "bg-primary" : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-card transition-transform",
          defaultOn ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </span>
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
    <div className="p-5 flex items-center gap-4 hover:bg-cream/30 transition-colors">
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
