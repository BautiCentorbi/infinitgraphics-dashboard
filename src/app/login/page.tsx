"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    window.location.href = callbackUrl;
  }

  return (
    <div
      className="relative w-full max-w-sm rounded-[22px] border p-9 backdrop-blur-2xl"
      style={{
        borderColor: "var(--border-strong)",
        background: "oklch(0.22 0.025 275 / 0.65)",
        boxShadow: "0 30px 80px -20px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(1 0 0 / 0.06)",
      }}
    >
      <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--teal)", boxShadow: "0 0 0 4px oklch(0.72 0.15 165 / 0.18)", animation: "pillPulse 2s ease-in-out infinite" }}
        />
        Suite para creadores de contenido
      </div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight font-display">Bienvenido de nuevo</h1>
      <p className="mb-7 text-sm" style={{ color: "var(--text-dim)" }}>
        Entrá para ver tus clientes, calendarios y métricas.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-xl border bg-black/20 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--sky)]"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
          Contraseña
          <input
            name="password"
            type="password"
            required
            className="rounded-xl border bg-black/20 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--sky)]"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className="btn-grad mt-1 w-full">
          {loading ? (
            <span
              className="h-3.5 w-3.5 rounded-full border-2 border-white/35 border-t-white"
              style={{ animation: "spin 0.7s linear infinite" }}
            />
          ) : (
            "Entrar →"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px]" style={{ color: "var(--text-faint)" }}>
        ¿Sos cliente y no tenés acceso? Pedíselo a tu Community Manager.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-blobs flex min-h-screen items-center justify-center p-6">
      <div className="grain" />
      <div className="absolute top-8 left-8 z-10 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[9px]"
          style={{ background: "var(--grad)", boxShadow: "0 6px 18px -4px var(--grad-shadow)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <rect x="3" y="4" width="18" height="17" rx="3" />
            <path d="M8 2v4M16 2v4M3 10h18" />
            <circle cx="9" cy="15" r="1.2" fill="white" stroke="none" />
            <circle cx="15" cy="15" r="1.2" fill="white" stroke="none" />
          </svg>
        </div>
        <span className="font-display text-[17px] font-bold">cm-suite</span>
      </div>

      <div className="relative z-10">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
