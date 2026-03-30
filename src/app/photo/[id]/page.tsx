import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import VoteButton from "@/components/VoteButton";
import { formatDate, compassLabel } from "@/lib/utils";
import Link from "next/link";
import type { PhotoWithProfile } from "@/lib/types";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("photos")
    .select("*, profiles(username, avatar_url)")
    .eq("id", id)
    .single();

  if (!photo) return { title: "Foto non trovata" };

  const typedPhoto = photo as PhotoWithProfile;
  return {
    title: `Arcobaleno di ${typedPhoto.profiles.username} | RainbowMap`,
    description: typedPhoto.description || "Una bellissima foto di arcobaleno condivisa su RainbowMap",
  };
}

export default async function PhotoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("*, profiles(username, avatar_url)")
    .eq("id", id)
    .single();

  if (!photo) notFound();

  const p = photo as PhotoWithProfile;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasVoted = false;
  if (user) {
    const { data: vote } = await supabase
      .from("votes")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("photo_id", id)
      .single();
    hasVoted = !!vote;
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary mb-4 hover:text-primary/80 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Indietro
      </Link>

      {/* Hero image */}
      <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden mb-6">
        <img
          src={p.image_url}
          alt="Rainbow"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 via-transparent" />
      </div>

      {/* Title area */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
            {p.description || "Vivid Horizon"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-primary">person</span>
            </div>
            <span className="text-sm font-medium text-on-surface">@{p.profiles.username}</span>
          </div>
        </div>
        <VoteButton
          photoId={p.id}
          initialVoteCount={p.vote_count}
          initialHasVoted={hasVoted}
          userId={user?.id ?? null}
          variant="large"
        />
      </div>

      {/* Stat chips */}
      <div className="flex justify-around items-center bg-surface-container-low rounded-lg py-4 mb-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-lg text-primary mb-1">schedule</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ora</p>
          <p className="text-sm font-extrabold text-on-surface">
            {new Date(p.taken_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="w-px h-8 bg-surface-container" />
        {p.compass_direction != null && (
          <>
            <div className="text-center">
              <span className="material-symbols-outlined text-lg text-primary mb-1">explore</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Direzione</p>
              <p className="text-sm font-extrabold text-on-surface">
                {compassLabel(p.compass_direction)} {p.compass_direction}°
              </p>
            </div>
            <div className="w-px h-8 bg-surface-container" />
          </>
        )}
        <div className="text-center">
          <span className="material-symbols-outlined text-lg text-primary mb-1">thermostat</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Data</p>
          <p className="text-sm font-extrabold text-on-surface">
            {new Date(p.taken_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="bg-surface-container-low rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-on-surface">Posizione</h3>
          <span className="text-xs font-semibold text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
          </span>
        </div>
        <div className="h-32 rounded-lg overflow-hidden bg-surface-container-highest flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">map</span>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${p.latitude}&mlon=${p.longitude}#map=15/${p.latitude}/${p.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center bg-vibrant-aura text-white text-sm font-bold py-2.5 rounded-full active:scale-95 transition-transform"
        >
          Vedi su mappa
        </a>
      </div>

      {/* Rating section */}
      <div className="bg-vibrant-aura rounded-lg p-8 text-white text-center mb-6">
        <h3 className="font-bold text-lg mb-2">Valuta questo arcobaleno</h3>
        <p className="text-sm text-white/80 mb-4">
          Quanto ti ha colpito questo spettro atmosferico?
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-lg">star</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comments section placeholder */}
      <div className="mb-6">
        <h3 className="font-bold text-on-surface mb-4">Commenti</h3>

        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant text-center py-8">
            I commenti saranno disponibili presto.
          </p>
        </div>

        {/* Comment input */}
        <div className="flex items-center gap-3 bg-surface-container-low p-2 pr-4 rounded-full mt-4">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-sm text-primary">person</span>
          </div>
          <input
            type="text"
            placeholder="Scrivi un commento..."
            className="flex-1 bg-transparent text-sm placeholder:text-on-surface-variant/50 focus:outline-none"
          />
          <button className="text-primary hover:text-primary/80 transition-colors">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>

      {/* Metadata footer */}
      <div className="text-xs text-on-surface-variant pb-4">
        <p>Pubblicata il {formatDate(p.created_at)}</p>
      </div>
    </div>
  );
}
