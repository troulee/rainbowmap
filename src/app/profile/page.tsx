import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PhotoCard from "@/components/PhotoCard";
import type { PhotoWithProfile } from "@/lib/types";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Il mio profilo | RainbowMap",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user photos
  const { data: photos } = await supabase
    .from("photos")
    .select("*, profiles!photos_user_id_fkey(username, avatar_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedPhotos = (photos ?? []) as PhotoWithProfile[];

  // Stats
  const totalVotes = typedPhotos.reduce((sum, p) => sum + p.vote_count, 0);

  return (
    <div className="max-w-2xl mx-auto px-6">
      {/* Profile header */}
      <div className="flex flex-col items-center text-center mb-8">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-tertiary p-0.5 mb-4">
          <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
          {profile?.username ?? "Utente"}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">Rainbow Chaser</p>
        <p className="text-xs text-on-surface-variant/60 mt-2 max-w-xs leading-relaxed">
          Catturando la bellezza fugace degli arcobaleni, un attimo alla volta.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-xl font-extrabold text-on-surface">{typedPhotos.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Catture</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-on-surface">{totalVotes}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Voti</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-on-surface">0</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Follower</p>
          </div>
        </div>
      </div>

      {/* Connected accounts (placeholder) */}
      <div className="bg-surface-container-low rounded-lg p-5 mb-8">
        <h2 className="font-bold text-on-surface text-sm mb-3">Account collegati</h2>
        <div className="space-y-3">
          {["Instagram", "Facebook", "Twitter"].map((social) => (
            <div key={social} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">link</span>
                </div>
                <span className="text-sm text-on-surface">{social}</span>
              </div>
              <button className="text-xs font-semibold text-primary">Collega</button>
            </div>
          ))}
        </div>
      </div>

      {/* Photo gallery */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-on-surface">La tua collezione</h2>
          <Link
            href="/upload"
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            <span className="material-symbols-outlined text-sm">add_a_photo</span>
            Nuova cattura
          </Link>
        </div>

        {typedPhotos.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">
              photo_library
            </span>
            <p className="text-on-surface-variant text-sm">Nessuna foto ancora.</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-vibrant-aura text-white text-sm font-bold px-5 py-2 rounded-full mt-4 active:scale-95 transition-transform"
            >
              Carica la prima
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {typedPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} variant="grid" />
            ))}
          </div>
        )}
      </div>

      {/* Sign out */}
      <form action="/auth/signout" method="POST" className="mb-8">
        <button
          type="submit"
          className="w-full text-center py-3 text-sm font-semibold text-error hover:bg-error-container/50 rounded-lg transition-colors"
        >
          Esci dall&apos;account
        </button>
      </form>
    </div>
  );
}
