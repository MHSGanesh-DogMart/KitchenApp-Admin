# Padosi · Admin

Next.js 15 + TypeScript + Tailwind admin console for managing the Padosi
home-chef marketplace. Brand mirrors the Flutter customer and partner apps —
tangerine `#FF5630`, cream surfaces, ink sidebar, Space Grotesk + Inter.

## Run it

```bash
cd "D:/Sample Structure/admin"
npm install
npm run dev    # http://localhost:3000
```

You'll land on `/login` → enter anything → routes to `/dashboard`.

## Stack

| Concern              | Pick                                          |
| -------------------- | --------------------------------------------- |
| Framework            | **Next.js 15** (App Router, Turbopack)        |
| Language             | TypeScript (strict)                           |
| Styling              | **Tailwind v3.4** + custom brand tokens       |
| UI primitives        | Rolled in `/components/ui` (no shadcn dep)    |
| Icons                | `lucide-react`                                |
| Charts               | `recharts`                                    |
| Fonts                | `next/font` — Space Grotesk + Inter           |
| Class helper         | `clsx` + `tailwind-merge` via `cn()`          |

## Structure

```
admin/
├── app/
│   ├── layout.tsx              # root, loads fonts + globals
│   ├── globals.css             # Tailwind + brand utilities
│   ├── page.tsx                # → redirects to /login
│   ├── login/
│   │   └── page.tsx            # premium 2-column login
│   └── (dashboard)/
│       ├── layout.tsx          # sidebar + main shell
│       ├── dashboard/page.tsx  # KPIs + revenue chart + tables
│       ├── cooks/page.tsx      # kitchens table
│       ├── orders/page.tsx     # stub
│       └── customers/page.tsx  # stub
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # ink command rail
│   │   └── Topbar.tsx          # search + bell
│   └── ui/
│       ├── Button.tsx
│       └── StatCard.tsx
├── lib/
│   ├── utils.ts                # cn(), inr(), shortDate()
│   └── mock-data.ts            # seed orders + cooks + revenue
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Brand tokens (Tailwind)

```ts
bg            #FAF7F1   // canvas
surface       #FFFFFF   // cards
cream         #F4EFE0   // soft chips, table headers
ink           #16181D   // body type, sidebar
ink-soft      #41454F   // secondary type
muted         #8B8E97   // tertiary type
line          #E9E3D6   // hairline borders
primary       #FF5630   // tangerine — CTAs
primary-soft  #FFE8DF   // hover, chips
secondary     #2A6F97   // blue — trust signals
success       #2E7D32   // delivered, paid
error         #D14343
```

Reusable classes in `globals.css`:
`.kicker`, `.h1-display`, `.h2-display`, `.card`, `.card-padded`,
`.nav-item`, `.nav-item-active`, `.chip`.

## Auth

Login is a stubbed form — wire `next-auth` (or your custom JWT endpoint)
when you have a backend. The submit handler is at
`app/login/page.tsx:onSubmit` and currently just pushes to `/dashboard`.

## Roadmap (waves)

- ✅ **Wave 0** — scaffolding, theme, login, dashboard shell, KPI + chart,
  cooks table, route stubs.
- **Wave 1** — Orders ledger (TanStack Table), filters, drill-down drawer.
- **Wave 2** — Customers directory + RFM segments.
- **Wave 3** — Payouts + cook earnings ledger.
- **Wave 4** — Coupons, broadcasts, reviews moderation.
- **Wave 5** — Settings (fee config, regions, role-based access).
- **Wave 6** — Real auth, real API integration, deploy.
