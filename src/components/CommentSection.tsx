"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  text: string;
  created_at: string;
  profiles: { username: string; avatar_url: string | null };
};

type CommentSectionProps = {
  photoId: string;
  userId: string | null;
  initialComments: Comment[];
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ora";
  if (minutes < 60) return `${minutes}m fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h fa`;
  const days = Math.floor(hours / 24);
  return `${days}g fa`;
}

export default function CommentSection({
  photoId,
  userId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !userId) {
      if (!userId) router.push("/auth/login");
      return;
    }

    const commentText = text.trim();
    setText("");

    startTransition(async () => {
      const { data, error } = await supabase
        .from("comments")
        .insert({ user_id: userId, photo_id: photoId, text: commentText })
        .select("id, text, created_at, profiles!comments_user_id_fkey(username, avatar_url)")
        .single();

      if (!error && data) {
        setComments((prev) => [...prev, data as unknown as Comment]);
      }
      router.refresh();
    });
  }

  return (
    <div>
      <h3 className="font-bold text-on-surface mb-4">
        Commenti {comments.length > 0 && <span className="text-on-surface-variant font-normal">({comments.length})</span>}
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-on-surface-variant text-center py-6">
          Nessun commento ancora. Scrivi il primo!
        </p>
      ) : (
        <div className="space-y-4 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm text-primary">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">{c.profiles.username}</span>
                  <span className="text-[10px] text-on-surface-variant">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-surface-container-low p-2 pr-4 rounded-full">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-sm text-primary">person</span>
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={userId ? "Scrivi un commento..." : "Accedi per commentare..."}
          maxLength={500}
          disabled={isPending}
          className="flex-1 bg-transparent text-sm placeholder:text-on-surface-variant/50 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="text-primary hover:text-primary/80 transition-colors disabled:opacity-30"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  );
}
