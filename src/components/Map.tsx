"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PhotoWithProfile } from "@/lib/types";
import { formatDate, compassLabel } from "@/lib/utils";
import Link from "next/link";

// Fix default marker icon
L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function FitBounds({ photos }: { photos: PhotoWithProfile[] }) {
  const map = useMap();
  if (photos.length > 0) {
    const bounds = L.latLngBounds(photos.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }
  return null;
}

type MapProps = {
  photos: PhotoWithProfile[];
  className?: string;
};

export default function RainbowMap({ photos, className }: MapProps) {
  return (
    <MapContainer
      center={[42.5, 12.5]}
      zoom={5}
      className={className ?? "h-full w-full"}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {photos.map((photo) => (
          <Marker key={photo.id} position={[photo.latitude, photo.longitude]}>
            <Popup>
              <div className="w-56">
                <Link href={`/photo/${photo.id}`}>
                  <img
                    src={photo.thumbnail_url || photo.image_url}
                    alt="Rainbow"
                    className="w-full h-36 object-cover rounded-lg mb-3"
                  />
                </Link>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    {photo.latitude.toFixed(2)}, {photo.longitude.toFixed(2)}
                  </p>
                </div>
                <h3 className="font-bold text-on-surface text-sm">
                  {photo.description || "Arcobaleno"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-on-surface-variant">@{photo.profiles.username}</span>
                  {photo.profiles.username && (
                    <span className="text-[10px] text-primary font-medium">Active Now</span>
                  )}
                </div>
                <Link
                  href={`/photo/${photo.id}`}
                  className="mt-3 block text-center bg-vibrant-aura text-white text-xs font-bold py-2 rounded-full active:scale-95 transition-transform"
                >
                  Vedi dettagli
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      {photos.length > 0 && <FitBounds photos={photos} />}
    </MapContainer>
  );
}
