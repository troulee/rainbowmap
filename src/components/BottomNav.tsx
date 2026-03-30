"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/explore", icon: "explore", label: "Explore" },
  { href: "/upload", icon: "add_circle", label: "Upload" },
  { href: "/contest", icon: "military_tech", label: "Contest" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
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
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
