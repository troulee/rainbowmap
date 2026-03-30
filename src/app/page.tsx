import { createClient } from "@/lib/supabase/server";
import PhotoCard from "@/components/PhotoCard";
import type { PhotoWithProfile } from "@/lib/types";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: photos } = await supabase
    .from("photos")
    .select("*, profiles!photos_user_id_fkey(username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(50);

  const typedPhotos = (photos ?? []) as PhotoWithProfile[];
  const trendingPhotos = [...typedPhotos].sort((a, b) => b.vote_count - a.vote_count).slice(0, 10);

  return (
    <div className="px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      {/* Search bar */}
      <div className="relative group">
        <span className="material-symbols-outlined absolute inset-y-0 left-4 flex items-center text-on-surface-variant pointer-events-none">
          search
        </span>
        <input
          type="text"
          placeholder="Cerca arcobaleni..."
          className="w-full bg-surface-container-highest border-none rounded-xl py-4 pl-12 pr-4 text-sm placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        <button className="bg-vibrant-aura text-white text-sm font-semibold px-5 py-2 rounded-full whitespace-nowrap active:scale-95 transition-transform">
          Recenti
        </button>
        <button className="bg-surface-container text-on-surface-variant text-sm font-semibold px-5 py-2 rounded-full whitespace-nowrap hover:bg-surface-container-high active:scale-95 transition-all">
          Trending
        </button>
        <button className="bg-surface-container text-on-surface-variant text-sm font-semibold px-5 py-2 rounded-full whitespace-nowrap hover:bg-surface-container-high active:scale-95 transition-all">
          Vicino a me
        </button>
      </div>

      {/* Featured / trending section */}
      {trendingPhotos.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary">local_fire_department</span>
            <h2 className="text-lg font-bold text-on-surface">Trending</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {trendingPhotos.slice(0, 5).map((photo) => (
              <Link
                key={photo.id}
                href={`/photo/${photo.id}`}
                className="group relative shrink-0 w-40 aspect-[3/4] rounded-lg overflow-hidden"
              >
                <img
                  src={photo.thumbnail_url || photo.image_url}
                  alt="Rainbow"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-bold truncate">
                    {photo.description || photo.profiles.username}
                  </p>
                  <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">favorite</span>
                    {photo.vote_count}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main feed */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">public</span>
          <h2 className="text-lg font-bold text-on-surface">Feed globale</h2>
        </div>

        {typedPhotos.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">
              cloud_upload
            </span>
            <p className="text-on-surface-variant font-medium">
              Nessun arcobaleno ancora.
            </p>
            <p className="text-on-surface-variant/60 text-sm mt-1">
              Sii il primo a condividerne uno!
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-vibrant-aura text-white font-bold px-6 py-2.5 rounded-full mt-6 active:scale-95 transition-transform shadow-md"
            >
              <span className="material-symbols-outlined text-lg">add_a_photo</span>
              Carica foto
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {typedPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} variant="feed" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
