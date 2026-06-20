import { Topbar } from "@/components/layout/Topbar";
import { broadcasts } from "@/lib/mock-data";
import { cn, shortDate } from "@/lib/utils";
import { Mail, MessageSquare, Plus, Smartphone } from "lucide-react";

export default function BroadcastsPage() {
  return (
    <>
      <Topbar
        title="Broadcasts"
        subtitle="Push, email and SMS announcements"
      />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Header strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {["All", "Sent", "Scheduled", "Drafts"].map((t, i) => (
              <button
                key={t}
                className={cn(
                  "h-9 px-3.5 rounded-full text-[12.5px] font-display font-bold border",
                  i === 0
                    ? "bg-ink text-white border-ink"
                    : "bg-surface text-ink-soft border-line hover:border-ink/30",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="h-10 px-4 rounded-xl bg-primary text-white font-display font-bold text-[13px] inline-flex items-center gap-2 hover:bg-primary-dark">
            <Plus className="h-4 w-4" /> New broadcast
          </button>
        </div>

        {/* Broadcasts list */}
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <article key={b.id} className="card overflow-hidden">
              <div className="p-5 flex items-start gap-4">
                <ChannelIcon channel={b.channel} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold text-ink text-[15px]">{b.title}</p>
                    <StatusChip status={b.status} />
                  </div>
                  <p className="text-[12px] text-muted mt-1.5">
                    {audienceLabel(b.audience)} · {b.recipients.toLocaleString("en-IN")} recipients
                    {b.sentAt && ` · ${b.status === "scheduled" ? "Sends" : "Sent"} ${shortDate(b.sentAt)}`}
                  </p>
                </div>
                <ChannelChip channel={b.channel} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function ChannelIcon({ channel }: { channel: string }) {
  const map: Record<string, { Icon: typeof Mail; tint: string; soft: string }> = {
    push:  { Icon: Smartphone,     tint: "text-primary",   soft: "bg-primary-soft" },
    email: { Icon: Mail,           tint: "text-secondary", soft: "bg-secondary-soft" },
    sms:   { Icon: MessageSquare,  tint: "text-success",   soft: "bg-success-soft" },
  };
  const { Icon, tint, soft } = map[channel] ?? map.push;
  return (
    <div className={cn("h-11 w-11 rounded-xl grid place-items-center shrink-0", soft)}>
      <Icon className={cn("h-5 w-5", tint)} strokeWidth={2.2} />
    </div>
  );
}

function ChannelChip({ channel }: { channel: string }) {
  const label = channel === "push" ? "Push" : channel === "email" ? "Email" : "SMS";
  return <span className="chip bg-cream text-ink-soft">{label}</span>;
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    sent:      { label: "Sent",      cls: "bg-success-soft text-success" },
    scheduled: { label: "Scheduled", cls: "bg-secondary-soft text-secondary" },
    draft:     { label: "Draft",     cls: "bg-cream text-muted" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}

function audienceLabel(a: string) {
  return a === "all" ? "Everyone" : a === "customers" ? "All customers" : "All cooks";
}
