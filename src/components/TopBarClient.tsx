"use client";

import Link from "next/link";
import LangSelector from "./LangSelector";
import { useLang } from "./LangProvider";

export default function TopBarClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t } = useLang();

  return (
    <header className="fixed top-0 w-full z-50 glass-nav h-16 flex items-center px-4 md:px-6">
      <div className="flex items-center gap-3 w-full max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-2xl text-primary">palette</span>
          <span className="hidden sm:inline text-xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
            RainbowMap
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-lg mx-auto relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder={t("search.placeholder")}
            className="w-full bg-surface-container-highest border-none rounded-full py-2.5 pl-10 pr-4 text-sm placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <LangSelector />
          {isLoggedIn ? (
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
              {t("auth.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
