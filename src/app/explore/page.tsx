import { createClient } from "@/lib/supabase/server";
import MapWrapper from "@/components/MapWrapper";
import type { PhotoWithProfile } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Esplora la mappa | RainbowMap",
};

export const revalidate = 60;

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: photos } = await supabase
    .from("photos")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(200);

  const typedPhotos = (photos ?? []) as PhotoWithProfile[];

  return (
    <div className="fixed inset-0 z-0">
      {/* Full-screen map */}
      <MapWrapper photos={typedPhotos} className="h-full w-full" />

      {/* Floating search */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg">
        <div className="glass-panel rounded-xl flex items-center gap-3 px-4 py-3 shadow-ambient">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Cerca posizioni..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
          <button className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">tune</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-3 justify-center">
          <button className="bg-vibrant-aura text-white text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform shadow-md">
            Live Now
          </button>
          <button className="glass-card text-on-surface text-xs font-semibold px-4 py-2 rounded-full hover:bg-white/80 active:scale-95 transition-all">
            Storici
          </button>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
        <button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center shadow-ambient hover:bg-white/90 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-primary">add</span>
        </button>
        <button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center shadow-ambient hover:bg-white/90 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-primary">remove</span>
        </button>
        <div className="h-2" />
        <button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center shadow-ambient hover:bg-white/90 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-primary">my_location</span>
        </button>
      </div>
    </div>
  );
}
