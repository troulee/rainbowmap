"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(next);
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <span className="material-symbols-outlined text-4xl text-primary mb-2">palette</span>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
          RainbowMap
        </h1>
      </div>

      <h2 className="text-xl font-bold text-on-surface text-center mb-6">Bentornato!</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-surface-container-highest border-none rounded-sm py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-surface-container-highest border-none rounded-sm py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
        </div>

        {error && (
          <div className="bg-error-container rounded-lg p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-sm">error</span>
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-vibrant-aura text-white font-bold py-3.5 rounded-full shadow-md active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        Non hai un account?{" "}
        <Link href={`/auth/signup?next=${next}`} className="font-semibold text-primary hover:text-primary/80">
          Registrati
        </Link>
      </p>

      <Link href="/" className="block text-center text-xs text-on-surface-variant/60 mt-4 hover:text-on-surface-variant">
        Torna alla home
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <Suspense fallback={<div className="animate-pulse text-on-surface-variant">Caricamento...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
