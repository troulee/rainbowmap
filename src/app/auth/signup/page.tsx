"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!termsAccepted) {
      setError("Devi accettare i termini di utilizzo per procedere.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

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
      <div className="flex flex-col items-center mb-8">
        <span className="material-symbols-outlined text-4xl text-primary mb-2">palette</span>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
          RainbowMap
        </h1>
      </div>

      <h2 className="text-xl font-bold text-on-surface text-center mb-6">Crea il tuo account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            title="Solo lettere, numeri e underscore"
            className="w-full bg-surface-container-highest border-none rounded-sm py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
        </div>

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

        {/* Terms acceptance */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary shrink-0"
            />
            <span className="text-xs text-on-surface-variant leading-relaxed">
              Accetto i{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-primary font-semibold underline hover:text-primary/80"
              >
                termini di utilizzo
              </button>{" "}
              e acconsento al riutilizzo delle foto caricate da parte di RainbowMap per finalità promozionali e pubblicitarie.
            </span>
          </label>
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
          {loading ? "Registrazione..." : "Crea account"}
        </button>
      </form>

      {/* Terms modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowTerms(false)}>
          <div className="bg-surface-container rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-on-surface">Termini di utilizzo</h3>
              <button onClick={() => setShowTerms(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-sm text-on-surface-variant leading-relaxed space-y-3">
              <p className="font-bold text-on-surface">Licenza d&apos;uso delle immagini</p>
              <p>
                Caricando foto su RainbowMap, l&apos;utente concede a RainbowMap una licenza non esclusiva, gratuita, mondiale e irrevocabile per utilizzare, riprodurre, modificare, pubblicare e distribuire le immagini caricate, inclusi ma non limitati a:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Materiale promozionale e pubblicitario del servizio</li>
                <li>Pubblicazioni sui canali social media di RainbowMap</li>
                <li>Collaborazioni con terze parti a fini promozionali</li>
                <li>Utilizzo editoriale e divulgativo</li>
              </ul>
              <p>
                L&apos;utente dichiara di essere il legittimo autore delle foto caricate e di avere i diritti necessari per concedere la presente licenza. Le foto non devono contenere volti riconoscibili di persone senza il loro consenso.
              </p>
              <p className="font-bold text-on-surface">Privacy e dati personali</p>
              <p>
                Le informazioni di geolocalizzazione associate alle foto saranno visibili pubblicamente sulla mappa. L&apos;utente è responsabile di non condividere foto che rivelino informazioni sensibili sulla propria posizione abituale.
              </p>
            </div>
            <button
              onClick={() => { setTermsAccepted(true); setShowTerms(false); }}
              className="w-full bg-vibrant-aura text-white font-bold py-3 rounded-full shadow-md active:scale-95 transition-transform"
            >
              Accetto i termini
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-on-surface-variant mt-6">
        Hai gia un account?{" "}
        <Link href={`/auth/login?next=${next}`} className="font-semibold text-primary hover:text-primary/80">
          Accedi
        </Link>
      </p>

      <Link href="/" className="block text-center text-xs text-on-surface-variant/60 mt-4 hover:text-on-surface-variant">
        Torna alla home
      </Link>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <Suspense fallback={<div className="animate-pulse text-on-surface-variant">Caricamento...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
