"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";

const navItems = [
  { href: "/", icon: "home", labelKey: "nav.home" },
  { href: "/explore", icon: "explore", labelKey: "nav.explore" },
  { href: "/upload", icon: "add_circle", labelKey: "nav.upload" },
  { href: "/contest", icon: "military_tech", labelKey: "nav.contest" },
  { href: "/profile", icon: "person", labelKey: "nav.profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="glass-nav rounded-full h-16 flex justify-around items-center px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center transition-all duration-300
                ${isActive
                  ? "bg-vibrant-aura text-white rounded-full p-3 scale-110 -translate-y-2 shadow-lg"
                  : "text-outline p-2 hover:text-primary active:scale-90"
                }
              `}
            >
              <span
                className={`material-symbols-outlined ${isActive ? "filled text-lg" : "text-xl"}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              {!isActive && (
                <span className="text-[10px] font-medium mt-0.5">{t(item.labelKey)}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
