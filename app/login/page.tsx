"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@padosi.in");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.207.75.184";
      const res = await fetch(`${apiUrl}/api/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Save credentials/token to localStorage
      localStorage.setItem("admin_token", data.data.token);
      localStorage.setItem("admin_email", data.data.admin.email);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.207.75.184";
      const res = await fetch(`${apiUrl}/api/admin/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Email not found");
      }

      setSuccessMessage(data.message || "Reset link sent successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="min-h-dvh grid lg:grid-cols-2 bg-bg">
      {/* Left: form */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-primary grid place-items-center text-2xl shadow-card">
              🏠
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-none tracking-tight">
                Padosi
              </p>
              <p className="kicker mt-1.5">Admin console</p>
            </div>
          </div>

          <h2 className="h1-display">Welcome back.</h2>
          <p className="text-[14px] text-ink-soft mt-2 leading-relaxed">
            Sign in to manage cooks, orders and payouts. Access is limited
            to authorised Padosi staff.
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[13px] font-medium">
              ⚠️ {error}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[13px] font-medium">
              ✅ {successMessage}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Field
              icon={<Mail className="h-4 w-4 text-muted" />}
              label="EMAIL"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@padosi.in"
            />
            <Field
              icon={<Lock className="h-4 w-4 text-muted" />}
              label="PASSWORD"
              type={show ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Your password"
              trailing={
                <button
                   type="button"
                   onClick={() => setShow((s) => !s)}
                   className="text-muted hover:text-ink p-1"
                   aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between text-[12.5px]">
              <label className="flex items-center gap-2 text-ink-soft cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-line accent-primary"
                />
                Keep me signed in
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="font-display font-bold text-primary hover:underline cursor-pointer bg-transparent border-none outline-none"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-7"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <p className="text-[11px] text-muted text-center mt-6">
            By signing in you agree to Padosi&apos;s admin{" "}
            <a className="underline">terms</a> and{" "}
            <a className="underline">acceptable use policy</a>.
          </p>
        </form>
      </div>

      {/* Right: marketing pane */}
      <aside className="hidden lg:flex relative bg-ink text-white overflow-hidden">
        {/* tangerine glow */}
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Real-time control
          </div>

          <div>
            <p className="font-display font-bold text-[44px] leading-[1.05] tracking-[-0.02em]">
              Every kitchen,
              <br />
              every order,
              <br />
              <span className="text-primary">one screen.</span>
            </p>
            <p className="text-white/70 mt-5 leading-relaxed max-w-md">
              Approve home chefs, resolve disputes, run promos and watch your
              neighbourhood food network grow — without leaving your desk.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Cooks live" value="142" />
            <Stat label="Orders today" value="1,284" />
            <Stat label="GMV month" value="₹18.4L" />
          </div>
        </div>
      </aside>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] backdrop-blur p-4 border border-white/[0.08]">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/55 font-display font-bold">
        {label}
      </p>
      <p className="font-display font-bold text-xl mt-1.5 tracking-tight">
        {value}
      </p>
    </div>
  );
}

type FieldProps = {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  trailing?: React.ReactNode;
};

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  trailing,
}: FieldProps) {
  return (
    <label className="block">
      <p className="kicker mb-2">{label}</p>
      <div className="flex items-center gap-3 h-12 px-3.5 bg-surface rounded-xl border border-line focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(255,86,48,0.12)] transition-all">
        {icon}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-[14px] bg-transparent outline-none placeholder:text-muted"
        />
        {trailing}
      </div>
    </label>
  );
}
