"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type StarRatingProps = {
  photoId: string;
  userId: string | null;
  initialScore: number | null;
  averageScore: number;
  totalRatings: number;
};

export default function StarRating({
  photoId,
  userId,
  initialScore,
  averageScore,
  totalRatings,
}: StarRatingProps) {
  const [score, setScore] = useState(initialScore);
  const [hovering, setHovering] = useState<number | null>(null);
  const [avg, setAvg] = useState(averageScore);
  const [total, setTotal] = useState(totalRatings);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  function handleRate(newScore: number) {
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    startTransition(async () => {
      if (score === newScore) {
        // Remove rating
        await supabase
          .from("ratings")
          .delete()
          .eq("user_id", userId)
          .eq("photo_id", photoId);
        setScore(null);
        if (total > 1) {
          setAvg((avg * total - newScore) / (total - 1));
        } else {
          setAvg(0);
        }
        setTotal((t) => t - 1);
      } else if (score != null) {
        // Update rating
        await supabase
          .from("ratings")
          .update({ score: newScore })
          .eq("user_id", userId)
          .eq("photo_id", photoId);
        setAvg((avg * total - score + newScore) / total);
        setScore(newScore);
      } else {
        // New rating
        await supabase
          .from("ratings")
          .insert({ user_id: userId, photo_id: photoId, score: newScore });
        setAvg((avg * total + newScore) / (total + 1));
        setTotal((t) => t + 1);
        setScore(newScore);
      }
      router.refresh();
    });
  }

  const displayScore = hovering ?? score ?? 0;

  return (
    <div className="bg-vibrant-aura rounded-lg p-8 text-white text-center">
      <h3 className="font-bold text-lg mb-1">Valuta questo arcobaleno</h3>
      {total > 0 && (
        <p className="text-sm text-white/80 mb-4">
          Media: {avg.toFixed(1)} / 5 ({total} {total === 1 ? "voto" : "voti"})
        </p>
      )}
      {total === 0 && (
        <p className="text-sm text-white/80 mb-4">
          Sii il primo a valutare!
        </p>
      )}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={isPending}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovering(star)}
            onMouseLeave={() => setHovering(null)}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              active:scale-90 transition-all disabled:opacity-50
              ${star <= displayScore ? "bg-white/40" : "bg-white/20 hover:bg-white/30"}
            `}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={star <= displayScore ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              star
            </span>
          </button>
        ))}
      </div>
      {score != null && (
        <p className="text-xs text-white/60 mt-3">
          La tua valutazione: {score}/5 (clicca di nuovo per rimuovere)
        </p>
      )}
    </div>
  );
}
