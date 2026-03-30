"use client";

import dynamic from "next/dynamic";
import type { PhotoWithProfile } from "@/lib/types";

const RainbowMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-surface-container-low">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-on-surface-variant text-sm font-medium">Caricamento mappa...</p>
      </div>
    </div>
  ),
});

export default function MapWrapper({
  photos,
  className,
}: {
  photos: PhotoWithProfile[];
  className?: string;
}) {
  return <RainbowMap photos={photos} className={className} />;
}
