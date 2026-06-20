import {
  ArrowUpRight,
  ChefHat,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { recentOrders, revenueSeries } from "@/lib/mock-data";
import { cn, inr } from "@/lib/utils";
import { RevenueChart } from "./RevenueChart";

export default function DashboardPage() {
  return (
    <>
      <Topbar
        title="Good morning, Hemanth"
        subtitle="Here's how the neighbourhood is doing today"
      />

      <div className="flex-1 p-6 lg:p-8 space-y-8">
        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Wallet}
            label="GMV TODAY"
            value="₹86,420"
            delta={{ value: "+18%", positive: true }}
            tint="primary"
          />
          <StatCard
            icon={Receipt}
            label="ORDERS TODAY"
            value="1,284"
            delta={{ value: "+12%", positive: true }}
            tint="secondary"
          />
          <StatCard
            icon={ChefHat}
            label="ACTIVE COOKS"
            value="142"
            delta={{ value: "+4", positive: true }}
            tint="success"
          />
          <StatCard
            icon={Users}
            label="NEW CUSTOMERS"
            value="86"
            delta={{ value: "+22%", positive: true }}
            tint="warn"
          />
        </section>

        {/* Chart + activity */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="card-padded xl:col-span-2">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="kicker">REVENUE</p>
                <p className="h2-display mt-1">Last 7 days</p>
              </div>
              <div className="flex gap-1.5 rounded-full bg-cream p-1">
                {["7d", "30d", "12m"].map((p) => (
                  <button
                    key={p}
                    className={cn(
                      "h-7 px-3 rounded-full text-[11.5px] font-display font-bold",
                      p === "7d"
                        ? "bg-white text-ink shadow-card"
                        : "text-muted",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <RevenueChart data={revenueSeries} />
          </div>

          {/* Top kitchens snapshot */}
          <div className="card-padded">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="kicker">TOP KITCHENS</p>
                <p className="h2-display mt-1">This week</p>
              </div>
              <a
                href="/cooks"
                className="text-primary text-[12.5px] font-display font-bold inline-flex items-center gap-1 hover:underline"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="space-y-3">
              {[
                { name: "Sunita Aunty", orders: 142, gmv: 28500 },
                { name: "Healthy Bowl Kitchen", orders: 96, gmv: 41200 },
                { name: "Lakshmi Amma", orders: 118, gmv: 22100 },
                { name: "Maa's Bengali Kitchen", orders: 64, gmv: 14200 },
              ].map((k, i) => (
                <div key={k.name} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-cream text-ink grid place-items-center font-display font-bold text-[12px]">
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-display font-bold text-ink truncate">
                      {k.name}
                    </p>
                    <p className="text-[11.5px] text-muted">
                      {k.orders} orders
                    </p>
                  </div>
                  <p className="font-display font-bold text-primary text-[13px]">
                    {inr(k.gmv)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent orders */}
        <section className="card overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div>
              <p className="kicker">LIVE</p>
              <p className="h2-display mt-1">Recent orders</p>
            </div>
            <a
              href="/orders"
              className="text-primary text-[12.5px] font-display font-bold inline-flex items-center gap-1 hover:underline"
            >
              See all <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-cream/60 text-ink-soft text-[11px] uppercase tracking-[0.12em]">
                <tr>
                  <th className="text-left font-display font-bold px-5 py-3">
                    Order
                  </th>
                  <th className="text-left font-display font-bold px-5 py-3">
                    Customer
                  </th>
                  <th className="text-left font-display font-bold px-5 py-3">
                    Cook
                  </th>
                  <th className="text-right font-display font-bold px-5 py-3">
                    Total
                  </th>
                  <th className="text-left font-display font-bold px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="px-5 py-4 font-display font-bold text-ink">
                      {o.id}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{o.customer}</td>
                    <td className="px-5 py-4 text-ink-soft">{o.cook}</td>
                    <td className="px-5 py-4 text-right font-display font-bold">
                      {inr(o.total)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusChip status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    delivered: {
      label: "Delivered",
      cls: "bg-success-soft text-success",
    },
    cooking: { label: "Cooking", cls: "bg-secondary-soft text-secondary" },
    out_for_delivery: {
      label: "Out for delivery",
      cls: "bg-primary-soft text-primary",
    },
    cancelled: { label: "Cancelled", cls: "bg-cream text-muted" },
  };
  const s = map[status] ?? { label: status, cls: "bg-cream text-muted" };
  return <span className={cn("chip", s.cls)}>{s.label}</span>;
}
