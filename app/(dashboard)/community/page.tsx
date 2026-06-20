import { Topbar } from "@/components/layout/Topbar";
import { posts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CheckCircle2, Flag, Heart, MessageSquare, Trash2 } from "lucide-react";

export default function CommunityPage() {
  const flagged = posts.filter((p) => p.flagged).length;
  return (
    <>
      <Topbar
        title="Community"
        subtitle={`${posts.length} posts · ${flagged} flagged`}
      />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-3">
          {[
            { label: "Flagged",  count: flagged,           active: true  },
            { label: "All",      count: posts.length,      active: false },
            { label: "Reported", count: flagged,           active: false },
          ].map((t) => (
            <button
              key={t.label}
              className={cn(
                "h-9 px-3.5 rounded-full text-[12.5px] font-display font-bold border inline-flex items-center gap-2",
                t.active
                  ? "bg-ink text-white border-ink"
                  : "bg-surface text-ink-soft border-line hover:border-ink/30",
              )}
            >
              {t.label}
              <span className={cn(
                "h-5 min-w-[20px] px-1.5 rounded-full text-[10.5px] grid place-items-center",
                t.active ? "bg-primary text-white" : "bg-cream text-ink-soft",
              )}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Post cards */}
        <div className="space-y-4 max-w-3xl">
          {posts.map((p) => (
            <article key={p.id} className={cn(
              "card-padded",
              p.flagged && "border-error/50 ring-1 ring-error/20",
            )}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-white grid place-items-center font-display font-bold text-[13px]">
                  {p.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-ink">{p.author}</p>
                  <p className="text-[11.5px] text-muted">Just now · {p.id}</p>
                </div>
                {p.flagged && (
                  <span className="chip bg-[#FFE3E3] text-error">
                    <Flag className="h-3 w-3" /> Reported
                  </span>
                )}
              </div>

              <p className="mt-4 text-[14px] text-ink leading-relaxed">{p.body}</p>

              <div className="mt-4 flex items-center gap-5 text-muted text-[12.5px]">
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="h-4 w-4" /> {p.likes}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" /> {p.comments}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-line flex items-center gap-2">
                <button className="h-9 px-3.5 rounded-xl bg-success-soft text-success font-display font-bold text-[12px] inline-flex items-center gap-1.5 hover:bg-success/15">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
                <button className="h-9 px-3.5 rounded-xl bg-[#FFF3D6] text-warn font-display font-bold text-[12px] inline-flex items-center gap-1.5 hover:bg-warn/20">
                  <Flag className="h-3.5 w-3.5" /> Keep flagged
                </button>
                <button className="ml-auto h-9 px-3.5 rounded-xl bg-[#FFE3E3] text-error font-display font-bold text-[12px] inline-flex items-center gap-1.5 hover:bg-error/15">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
