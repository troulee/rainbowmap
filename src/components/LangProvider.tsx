"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type LangCode, getDefaultLang, t as translate } from "@/lib/i18n";

type LangContextType = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
};

const LangContext = createContext<LangContextType>({
  lang: "it",
  setLang: () => {},
  t: (key) => key,
});

export function useLang() {
  return useContext(LangContext);
}

export default function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("it");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLangState(getDefaultLang());
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem("rainbowmap-lang", newLang);
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}
