"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
};

export default function LocationPicker({ latitude, longitude, onLocationSelect }: LocationPickerProps) {
  return (
    <div className="h-48 rounded-lg overflow-hidden">
      <MapContainer
        center={[latitude ?? 42.5, longitude ?? 12.5]}
        zoom={latitude ? 13 : 5}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onLocationSelect={onLocationSelect} />
        {latitude != null && longitude != null && (
          <Marker position={[latitude, longitude]} />
        )}
      </MapContainer>
    </div>
  );
}
