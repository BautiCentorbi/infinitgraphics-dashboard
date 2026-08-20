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
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10"
    >
      <h1 className="text-lg font-semibold">cm-suite</h1>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input
          name="password"
          type="password"
          required
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
