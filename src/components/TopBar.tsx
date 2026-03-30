import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 w-full z-50 glass-nav h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-primary">palette</span>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
            RainbowMap
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/profile"
              className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg text-primary">person</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Accedi
            </Link>
          )}
          <button className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">notifications</span>
          </button>
        </div>
      </div>
    </header>
  );
}
