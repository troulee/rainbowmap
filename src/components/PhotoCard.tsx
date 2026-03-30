import Link from "next/link";
import type { PhotoWithProfile } from "@/lib/types";
import { formatDate, compassLabel } from "@/lib/utils";

type PhotoCardProps = {
  photo: PhotoWithProfile;
  variant?: "feed" | "compact" | "grid";
};

export default function PhotoCard({ photo, variant = "feed" }: PhotoCardProps) {
  if (variant === "grid") {
    return (
      <Link
        href={`/photo/${photo.id}`}
        className="group relative aspect-square rounded-lg overflow-hidden"
      >
        <img
          src={photo.thumbnail_url || photo.image_url}
          alt="Rainbow"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-xs font-semibold truncate">{photo.profiles.username}</p>
          <div className="flex items-center gap-1 text-white/80 text-[10px]">
            <span className="material-symbols-outlined text-[12px]">favorite</span>
            {photo.vote_count}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/photo/${photo.id}`}
        className="group flex gap-3 items-center p-2 rounded-lg hover:bg-surface-container-low transition-colors"
      >
        <img
          src={photo.thumbnail_url || photo.image_url}
          alt="Rainbow"
          className="w-14 h-14 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">
            {photo.description || "Arcobaleno"}
          </p>
          <p className="text-xs text-on-surface-variant">{photo.profiles.username}</p>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant text-xs shrink-0">
          <span className="material-symbols-outlined text-sm text-secondary">favorite</span>
          {photo.vote_count}
        </div>
      </Link>
    );
  }

  // Feed variant (default)
  return (
    <Link
      href={`/photo/${photo.id}`}
      className="group block rounded-lg overflow-hidden bg-surface-container-low"
    >
      <div className="relative aspect-[4/5] md:aspect-video overflow-hidden">
        <img
          src={photo.thumbnail_url || photo.image_url}
          alt="Rainbow"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Glass overlay */}
        <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {photo.description && (
                <h3 className="font-bold text-on-surface text-base leading-tight line-clamp-1 mb-1">
                  {photo.description}
                </h3>
              )}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                </div>
                <span className="text-sm font-medium text-on-surface">{photo.profiles.username}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-surface-container-lowest/60 rounded-full px-3 py-1.5">
              <span className="material-symbols-outlined text-sm text-secondary filled" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              <span className="text-sm font-bold text-on-surface">{photo.vote_count}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {formatDate(photo.taken_at)}
            </div>
            {photo.compass_direction != null && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">explore</span>
                {compassLabel(photo.compass_direction)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
