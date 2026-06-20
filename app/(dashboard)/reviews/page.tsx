import { Topbar } from "@/components/layout/Topbar";
import { reviews } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CheckCircle2, Flag, Star, Trash2 } from "lucide-react";

export default function ReviewsPage() {
  const flagged = reviews.filter((r) => r.flagged).length;
  return (
    <>
      <Topbar
        title="Reviews"
        subtitle={`${reviews.length} total · ${flagged} flagged for moderation`}
      />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { label: "Flagged", count: flagged, active: true },
            { label: "All", count: reviews.length, active: false },
            { label: "Approved", count: reviews.length - flagged, active: false },
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

        {/* Review cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <article key={r.id} className={cn(
              "card-padded",
              r.flagged && "border-error/50 ring-1 ring-error/20",
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-cream text-ink grid place-items-center font-display font-bold text-[13px]">
                    {r.reviewer[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-ink">{r.reviewer}</p>
                    <p className="text-[11.5px] text-muted truncate">
                      reviewed <span className="text-ink-soft">{r.cook}</span>
                    </p>
                  </div>
                </div>
                <RatingChip rating={r.rating} />
              </div>

              <div className="mt-4 rounded-xl bg-cream p-4">
                <div className="flex gap-2">
                  <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" fill="currentColor" />
                  <p className="text-[13.5px] text-ink leading-relaxed">{r.body}</p>
                </div>
              </div>

              {r.flagged && (
                <div className="mt-3 inline-flex items-center gap-2 chip bg-[#FFE3E3] text-error">
                  <Flag className="h-3 w-3" />
                  Reported · {r.reportedReason}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
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

function RatingChip({ rating }: { rating: number }) {
  const positive = rating >= 4;
  return (
    <span className={cn(
      "chip",
      positive ? "bg-[#FFF3D6] text-warn" : "bg-[#FFE3E3] text-error",
    )}>
      <Star className="h-3 w-3" fill="currentColor" />
      {rating.toFixed(1)}
    </span>
  );
}
