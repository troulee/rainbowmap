import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "RainbowMap - Condividi arcobaleni dal mondo",
  description:
    "Carica e condividi foto di arcobaleni su una mappa interattiva. Vota le foto più belle e scopri arcobaleni da tutto il mondo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        <TopBar />
        <main className="flex-1 pt-16 pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
