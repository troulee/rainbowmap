import { createClient } from "@/lib/supabase/server";
import PhotoCard from "@/components/PhotoCard";
import type { PhotoWithProfile } from "@/lib/types";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foto del mese | RainbowMap",
};

export const revalidate = 60;

export default async function ContestPage() {
  const supabase = await createClient();

  // Get top voted photos this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyPhotos } = await supabase
    .from("photos")
    .select("*, profiles(username, avatar_url)")
    .gte("created_at", startOfMonth.toISOString())
    .order("vote_count", { ascending: false })
    .limit(20);

  const typedPhotos = (monthlyPhotos ?? []) as PhotoWithProfile[];
  const winner = typedPhotos[0];
  const honorable = typedPhotos.slice(1, 4);

  const monthName = new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8">
      {/* Hero section */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
          <span className="material-symbols-outlined text-sm align-middle mr-1">military_tech</span>
          Foto del mese
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </h1>
      </div>

      {/* Winner */}
      {winner ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Winner photo */}
          <Link
            href={`/photo/${winner.id}`}
            className="lg:col-span-8 group relative aspect-[4/5] md:aspect-video rounded-lg overflow-hidden"
          >
            <img
              src={winner.image_url}
              alt="Winner"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
            <div className="absolute top-4 left-4">
              <span className="bg-vibrant-aura text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                Vincitore
              </span>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">
                {winner.description || "Arcobaleno del mese"}
              </h2>
              <p className="text-white/80 text-sm mt-2">
                di @{winner.profiles.username}
              </p>
            </div>
          </Link>

          {/* Winner details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-low rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-tertiary p-0.5">
                  <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">person</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-on-surface">{winner.profiles.username}</p>
                  <p className="text-xs text-on-surface-variant">Fotografo del mese</p>
                </div>
              </div>

              <div className="flex justify-around py-4 bg-surface-container rounded-lg">
                <div className="text-center">
                  <span className="material-symbols-outlined text-primary mb-1">favorite</span>
                  <p className="text-lg font-extrabold text-on-surface">{winner.vote_count}</p>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Voti</p>
                </div>
                <div className="w-px h-12 bg-surface-container-highest" />
                <div className="text-center">
                  <span className="material-symbols-outlined text-primary mb-1">location_on</span>
                  <p className="text-lg font-extrabold text-on-surface">
                    {winner.latitude.toFixed(1)}°
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Lat</p>
                </div>
              </div>
            </div>

            <Link
              href={`/photo/${winner.id}`}
              className="block text-center bg-vibrant-aura text-white font-bold py-3 rounded-full shadow-md active:scale-95 transition-transform"
            >
              Vedi dettagli
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-container-low rounded-lg mb-12">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">
            military_tech
          </span>
          <p className="text-on-surface-variant font-medium">
            Nessuna foto questo mese ancora.
          </p>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            Carica un arcobaleno per partecipare!
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-vibrant-aura text-white font-bold px-6 py-2.5 rounded-full mt-6 active:scale-95 transition-transform shadow-md"
          >
            Partecipa
          </Link>
        </div>
      )}

      {/* Honorable mentions */}
      {honorable.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold text-on-surface mb-4">Menzioni d&apos;onore</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {honorable.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} variant="feed" />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="bg-surface-container rounded-lg p-8 md:p-12 text-center relative overflow-hidden mb-8">
        {/* Background blurs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-tertiary-container/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-container/30 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight mb-2">
            Cattura la magia il prossimo mese
          </h2>
          <p className="text-sm text-on-surface-variant mb-6 max-w-md mx-auto leading-relaxed">
            Condividi i tuoi arcobaleni e partecipa al concorso mensile.
            La foto con piu voti vince!
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-vibrant-aura text-white font-bold px-8 py-3 rounded-full shadow-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">add_a_photo</span>
            Carica un arcobaleno
          </Link>
        </div>
      </div>
    </div>
  );
}
