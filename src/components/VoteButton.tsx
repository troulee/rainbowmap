"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type VoteButtonProps = {
  photoId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  userId: string | null;
  variant?: "default" | "large";
};

export default function VoteButton({
  photoId,
  initialVoteCount,
  initialHasVoted,
  userId,
  variant = "default",
}: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  async function handleVote() {
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    startTransition(async () => {
      if (hasVoted) {
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("user_id", userId)
          .eq("photo_id", photoId);
        if (!error) {
          setHasVoted(false);
          setVoteCount((c) => c - 1);
        }
      } else {
        const { error } = await supabase
          .from("votes")
          .insert({ user_id: userId, photo_id: photoId });
        if (!error) {
          setHasVoted(true);
          setVoteCount((c) => c + 1);
        }
      }
      router.refresh();
    });
  }

  if (variant === "large") {
    return (
      <button
        onClick={handleVote}
        disabled={isPending}
        className={`
          flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all active:scale-95 duration-200 disabled:opacity-50
          ${hasVoted
            ? "bg-secondary-container text-on-secondary-container"
            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }
        `}
      >
        <span
          className={`material-symbols-outlined text-xl ${hasVoted ? "text-secondary" : ""}`}
          style={hasVoted ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          favorite
        </span>
        <span className="text-lg">{voteCount}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95 duration-200 disabled:opacity-50
        ${hasVoted
          ? "bg-secondary-container text-on-secondary-container"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
        }
      `}
    >
      <span
        className={`material-symbols-outlined text-sm ${hasVoted ? "text-secondary" : ""}`}
        style={hasVoted ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        favorite
      </span>
      <span>{voteCount}</span>
    </button>
  );
}
