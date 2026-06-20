/**
 * Mock seed for the admin. Replace with real API calls once the
 * backend is wired. All amounts are INR.
 */

// ─────────────────────── orders ───────────────────────

export type Order = {
  id: string;
  customer: string;
  cook: string;
  items: number;
  total: number;
  status: "delivered" | "cooking" | "out_for_delivery" | "cancelled" | "refunded";
  payment: "UPI" | "Card" | "Wallet" | "COD";
  placedAt: Date;
};

export const recentOrders: Order[] = [
  {
    id: "#PD4821",
    customer: "Priya Mehta",
    cook: "Sunita Aunty",
    items: 3,
    total: 320,
    status: "out_for_delivery",
    payment: "UPI",
    placedAt: new Date(),
  },
  {
    id: "#PD4820",
    customer: "Ravi K.",
    cook: "Sunita Aunty",
    items: 2,
    total: 180,
    status: "cooking",
    payment: "UPI",
    placedAt: new Date(),
  },
  {
    id: "#PD4818",
    customer: "Hemanth",
    cook: "Lakshmi Amma",
    items: 2,
    total: 240,
    status: "delivered",
    payment: "Card",
    placedAt: new Date(Date.now() - 36e5),
  },
  {
    id: "#PD4815",
    customer: "Anita Rao",
    cook: "Jain Rasoi",
    items: 1,
    total: 130,
    status: "delivered",
    payment: "Wallet",
    placedAt: new Date(Date.now() - 72e5),
  },
  {
    id: "#PD4812",
    customer: "Sneha Iyer",
    cook: "Healthy Bowl Kitchen",
    items: 4,
    total: 540,
    status: "delivered",
    payment: "UPI",
    placedAt: new Date(Date.now() - 86e5),
  },
  {
    id: "#PD4810",
    customer: "Karan Joshi",
    cook: "Lakshmi Amma",
    items: 1,
    total: 90,
    status: "refunded",
    payment: "UPI",
    placedAt: new Date(Date.now() - 18 * 36e5),
  },
  {
    id: "#PD4790",
    customer: "Vivek M.",
    cook: "Sunita Aunty",
    items: 2,
    total: 240,
    status: "cancelled",
    payment: "COD",
    placedAt: new Date(Date.now() - 24 * 36e5),
  },
];

// ─────────────────────── cooks ───────────────────────

export type Cook = {
  id: string;
  name: string;
  tier: 1 | 2;
  status: "active" | "pending_verification" | "suspended";
  rating: number;
  earnings30d: number;
  orders30d: number;
  fssai: string;
  city: string;
};

export const cooks: Cook[] = [
  { id: "ck_001", name: "Sunita Aunty",         tier: 1, status: "active",                rating: 4.9, earnings30d: 28500, orders30d: 142, fssai: "1224 5678 1234 81", city: "Bengaluru" },
  { id: "ck_002", name: "Lakshmi Amma",         tier: 1, status: "active",                rating: 4.8, earnings30d: 22100, orders30d: 118, fssai: "1019 4567 8901 22", city: "Bengaluru" },
  { id: "ck_003", name: "Jain Rasoi",           tier: 1, status: "pending_verification",  rating: 5.0, earnings30d:     0, orders30d:   0, fssai: "—",                  city: "Bengaluru" },
  { id: "ck_004", name: "Healthy Bowl Kitchen", tier: 2, status: "active",                rating: 4.7, earnings30d: 41200, orders30d:  96, fssai: "1019 4567 0000 22", city: "Bengaluru" },
];

// ─────────────────────── customers ───────────────────────

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  lifetimeOrders: number;
  lifetimeSpend: number;
  segment: "champion" | "loyal" | "new" | "at_risk";
  joinedAt: Date;
};

export const customers: Customer[] = [
  { id: "cu_001", name: "Priya Mehta",  phone: "+91 98xxxxxx12", email: "priya@gmail.com",  city: "Bengaluru", lifetimeOrders: 86, lifetimeSpend: 18420, segment: "champion", joinedAt: new Date(2024, 5, 12) },
  { id: "cu_002", name: "Hemanth Reddy", phone: "+91 93xxxxxx08", email: "hemanth@mtouchlabs.com", city: "Hyderabad", lifetimeOrders: 32, lifetimeSpend: 6240, segment: "loyal", joinedAt: new Date(2025, 1, 18) },
  { id: "cu_003", name: "Ravi K.",      phone: "+91 90xxxxxx55", email: "ravi.k@outlook.com", city: "Bengaluru", lifetimeOrders: 12, lifetimeSpend: 2180, segment: "loyal", joinedAt: new Date(2025, 7, 4) },
  { id: "cu_004", name: "Anita Rao",    phone: "+91 87xxxxxx20", email: "anita.r@gmail.com", city: "Chennai", lifetimeOrders: 2,  lifetimeSpend:  320, segment: "new", joinedAt: new Date(2026, 4, 2) },
  { id: "cu_005", name: "Karan Joshi",  phone: "+91 99xxxxxx41", email: "karanj@yahoo.com",  city: "Mumbai",   lifetimeOrders: 9,  lifetimeSpend: 1840, segment: "at_risk", joinedAt: new Date(2024, 10, 1) },
];

// ─────────────────────── payouts ───────────────────────

export type Payout = {
  id: string;
  cook: string;
  cycle: string;
  orders: number;
  gross: number;
  commission: number;
  net: number;
  status: "paid" | "pending" | "failed";
  paidAt: Date | null;
};

export const payouts: Payout[] = [
  { id: "po_2026_w22_001", cook: "Sunita Aunty",         cycle: "2026 W22", orders: 142, gross: 28500, commission: 4275, net: 24225, status: "paid",    paidAt: new Date(2026, 5, 2) },
  { id: "po_2026_w22_002", cook: "Lakshmi Amma",         cycle: "2026 W22", orders: 118, gross: 22100, commission: 3315, net: 18785, status: "paid",    paidAt: new Date(2026, 5, 2) },
  { id: "po_2026_w22_003", cook: "Healthy Bowl Kitchen", cycle: "2026 W22", orders:  96, gross: 41200, commission: 6180, net: 35020, status: "pending", paidAt: null },
  { id: "po_2026_w21_001", cook: "Sunita Aunty",         cycle: "2026 W21", orders: 138, gross: 27600, commission: 4140, net: 23460, status: "paid",    paidAt: new Date(2026, 4, 26) },
  { id: "po_2026_w21_004", cook: "Maa's Bengali Kitchen",cycle: "2026 W21", orders:  42, gross:  9400, commission: 1410, net:  7990, status: "failed",  paidAt: null },
];

// ─────────────────────── coupons ───────────────────────

export type Coupon = {
  code: string;
  description: string;
  type: "flat" | "percent" | "free_delivery";
  value: number;
  redemptions: number;
  cap: number;
  status: "active" | "scheduled" | "expired";
  endsAt: Date;
};

export const coupons: Coupon[] = [
  { code: "FRESH50",     description: "Flat ₹50 off first order",         type: "flat",          value: 50,  redemptions: 1842, cap: 5000, status: "active",    endsAt: new Date(2026, 6, 30) },
  { code: "LUNCH20",     description: "20% off lunch orders 11-2 PM",     type: "percent",       value: 20,  redemptions:  624, cap: 2000, status: "active",    endsAt: new Date(2026, 5, 31) },
  { code: "FREEDEL",     description: "Free delivery on ₹199+",           type: "free_delivery", value:   0, redemptions: 3812, cap: 9999, status: "active",    endsAt: new Date(2026, 5, 20) },
  { code: "MONSOON25",   description: "₹25 off · monsoon special",        type: "flat",          value: 25,  redemptions:    0, cap: 3000, status: "scheduled", endsAt: new Date(2026, 7, 31) },
  { code: "DIWALI50",    description: "Flat ₹50 off Diwali week",         type: "flat",          value: 50,  redemptions: 4216, cap: 5000, status: "expired",   endsAt: new Date(2025, 10, 14) },
];

// ─────────────────────── reviews ───────────────────────

export type Review = {
  id: string;
  reviewer: string;
  cook: string;
  rating: number;
  body: string;
  flagged: boolean;
  reportedReason?: string;
  createdAt: Date;
};

export const reviews: Review[] = [
  { id: "rv_001", reviewer: "Priya M.",  cook: "Lakshmi Amma",         rating: 5.0, body: "The real Andhra meals I'd been missing in Bangalore. Hot, fresh, and just like home. 😍", flagged: false, createdAt: new Date(Date.now() - 6 * 36e5) },
  { id: "rv_002", reviewer: "Ravi K.",   cook: "Sunita Aunty",         rating: 4.8, body: "Tried the rajma chawal yesterday — exactly the comfort food my mom used to make.",  flagged: false, createdAt: new Date(Date.now() - 24 * 36e5) },
  { id: "rv_003", reviewer: "Karan J.",  cook: "Jain Rasoi",           rating: 1.0, body: "Worst food ever, don't order from these scammers!!!", flagged: true, reportedReason: "Defamation", createdAt: new Date(Date.now() - 4 * 36e5) },
  { id: "rv_004", reviewer: "Sneha",     cook: "Healthy Bowl Kitchen", rating: 4.6, body: "Quinoa power bowl is genuinely the best lunch I've had in months. Will order again.", flagged: false, createdAt: new Date(Date.now() - 48 * 36e5) },
];

// ─────────────────────── community posts ───────────────────────

export type Post = {
  id: string;
  author: string;
  body: string;
  likes: number;
  comments: number;
  flagged: boolean;
  createdAt: Date;
};

export const posts: Post[] = [
  { id: "po_001", author: "Jain Rasoi",   body: "Pure Jain food, no onion-garlic. Lunch orders in Block 5 starting Monday 🙏", likes: 64, comments: 9, flagged: false, createdAt: new Date(Date.now() - 2 * 36e5) },
  { id: "po_002", author: "Maa's Bengali Kitchen", body: "Bhetki paturi this Friday — wrapped in banana leaf, served with bhaat.", likes: 41, comments: 6, flagged: false, createdAt: new Date(Date.now() - 8 * 36e5) },
  { id: "po_003", author: "Random Cook",  body: "Buy directly from us on WhatsApp, way cheaper. Number in bio.", likes: 2, comments: 1, flagged: true, createdAt: new Date(Date.now() - 36e5) },
];

// ─────────────────────── broadcasts ───────────────────────

export type Broadcast = {
  id: string;
  title: string;
  audience: "all" | "customers" | "cooks";
  channel: "push" | "email" | "sms";
  status: "sent" | "scheduled" | "draft";
  sentAt: Date | null;
  recipients: number;
};

export const broadcasts: Broadcast[] = [
  { id: "br_001", title: "Monsoon menu is live across Bengaluru 🌧",  audience: "customers", channel: "push",  status: "sent",      sentAt: new Date(Date.now() - 24 * 36e5), recipients: 12480 },
  { id: "br_002", title: "Friday payout cycle locked at 6 PM",          audience: "cooks",     channel: "push",  status: "sent",      sentAt: new Date(Date.now() - 80 * 36e5), recipients:   142 },
  { id: "br_003", title: "Diwali coupons are live — share with friends", audience: "all",       channel: "email", status: "scheduled", sentAt: new Date(2026, 9, 30),            recipients: 18500 },
  { id: "br_004", title: "FSSAI re-verification drive — June",          audience: "cooks",     channel: "email", status: "draft",     sentAt: null,                              recipients:   142 },
];

// ─────────────────────── revenue series ───────────────────────

export const revenueSeries: { day: string; revenue: number }[] = [
  { day: "Mon", revenue:  8200 },
  { day: "Tue", revenue:  9450 },
  { day: "Wed", revenue: 11200 },
  { day: "Thu", revenue: 10100 },
  { day: "Fri", revenue: 13800 },
  { day: "Sat", revenue: 17600 },
  { day: "Sun", revenue: 15900 },
];
