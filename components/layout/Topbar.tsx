import { Bell, Search } from "lucide-react";

export function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="flex items-center gap-4 px-6 lg:px-8 h-16">
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-[18px] tracking-tight leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-muted mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-xl bg-surface border border-line min-w-[260px]">
          <Search className="h-4 w-4 text-muted" />
          <input
            placeholder="Search orders, cooks, customers"
            className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-muted"
          />
          <kbd className="hidden md:inline-flex items-center px-1.5 h-5 rounded-md border border-line text-[10px] text-muted font-medium">
            /
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative h-10 w-10 rounded-xl bg-surface border border-line grid place-items-center hover:border-ink/30 transition-colors">
          <Bell className="h-4 w-4 text-ink" strokeWidth={2.2} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-bg" />
        </button>
      </div>
    </header>
  );
}
