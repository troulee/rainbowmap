import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import VoteButton from "@/components/VoteButton";
import StarRating from "@/components/StarRating";
import CommentSection from "@/components/CommentSection";
import { formatDate, compassLabel } from "@/lib/utils";
import Link from "next/link";
import type { PhotoWithProfile } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("photos")
    .select("*, profiles!photos_user_id_fkey(username, avatar_url)")
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
    .select("*, profiles!photos_user_id_fkey(username, avatar_url)")
    .eq("id", id)
    .single();

  if (!photo) notFound();

  const p = photo as PhotoWithProfile;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check vote
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

  // Fetch user's rating
  let userRating: number | null = null;
  if (user) {
    const { data: rating } = await supabase
      .from("ratings")
      .select("score")
      .eq("user_id", user.id)
      .eq("photo_id", id)
      .single();
    userRating = (rating as { score: number } | null)?.score ?? null;
  }

  // Fetch average rating
  const { data: allRatings } = await supabase
    .from("ratings")
    .select("score")
    .eq("photo_id", id);

  const ratings = allRatings ?? [];
  const avgScore = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r as { score: number }).score, 0) / ratings.length
    : 0;

  // Fetch comments
  const { data: comments } = await supabase
    .from("comments")
    .select("id, text, created_at, profiles!comments_user_id_fkey(username, avatar_url)")
    .eq("photo_id", id)
    .order("created_at", { ascending: true });

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

      {/* Star Rating */}
      <div className="mb-6">
        <StarRating
          photoId={p.id}
          userId={user?.id ?? null}
          initialScore={userRating}
          averageScore={avgScore}
          totalRatings={ratings.length}
        />
      </div>

      {/* Comments */}
      <div className="mb-6">
        <CommentSection
          photoId={p.id}
          userId={user?.id ?? null}
          initialComments={(comments ?? []) as any}
        />
      </div>

      {/* Metadata footer */}
      <div className="text-xs text-on-surface-variant pb-4">
        <p>Pubblicata il {formatDate(p.created_at)}</p>
      </div>
    </div>
  );
}
