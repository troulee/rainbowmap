"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { extractExif, compressImage, compressThumbnail } from "@/lib/utils";
import CompassPicker from "./CompassPicker";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-48 bg-surface-container-highest rounded-lg animate-pulse" />,
});

const steps = [
  { label: "Foto", icon: "add_a_photo" },
  { label: "Posizione", icon: "location_on" },
  { label: "Dettagli", icon: "tune" },
];

export default function UploadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [direction, setDirection] = useState<number | null>(null);
  const [takenAt, setTakenAt] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));

    const exif = await extractExif(selectedFile);
    if (exif.latitude != null && exif.longitude != null) {
      setLatitude(exif.latitude);
      setLongitude(exif.longitude);
    }
    if (exif.direction != null) setDirection(exif.direction);
    if (exif.takenAt) {
      const d = exif.takenAt;
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setTakenAt(local);
    }

    setStep(1);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f?.type.startsWith("image/")) handleFileChange(f);
    },
    [handleFileChange]
  );

  async function handleSubmit() {
    if (!file || latitude == null || longitude == null || !takenAt) {
      setError("Compila tutti i campi obbligatori.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [compressed, thumbnail] = await Promise.all([
        compressImage(file),
        compressThumbnail(file),
      ]);

      const timestamp = Date.now();
      const basePath = `${userId}/${timestamp}`;

      const [mainUpload, thumbUpload] = await Promise.all([
        supabase.storage.from("photos").upload(`${basePath}/full.jpg`, compressed, { contentType: "image/jpeg" }),
        supabase.storage.from("photos").upload(`${basePath}/thumb.jpg`, thumbnail, { contentType: "image/jpeg" }),
      ]);

      if (mainUpload.error) throw mainUpload.error;
      if (thumbUpload.error) throw thumbUpload.error;

      const { data: { publicUrl: imageUrl } } = supabase.storage.from("photos").getPublicUrl(`${basePath}/full.jpg`);
      const { data: { publicUrl: thumbnailUrl } } = supabase.storage.from("photos").getPublicUrl(`${basePath}/thumb.jpg`);

      const { error: insertError } = await supabase.from("photos").insert({
        user_id: userId,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        latitude,
        longitude,
        compass_direction: direction,
        taken_at: new Date(takenAt).toISOString(),
        description: description || null,
      });

      if (insertError) throw insertError;

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il caricamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress steps */}
      <div className="flex justify-between items-center px-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1">
            <button
              onClick={() => i < step ? setStep(i) : undefined}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${i <= step
                  ? "bg-vibrant-aura text-white shadow-md"
                  : "bg-surface-container-highest text-on-surface"
                }
              `}
            >
              <span className="material-symbols-outlined text-lg">{s.icon}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`h-[2px] flex-1 mx-3 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-surface-container-highest"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Photo */}
      {step === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("file-input")?.click()}
          className="aspect-[4/3] bg-surface-container-low rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Anteprima" className="max-h-full rounded-lg object-contain" />
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
              </div>
              <p className="text-on-surface font-semibold">Tocca per caricare la foto</p>
              <p className="text-on-surface-variant text-xs mt-1">PNG, JPG o HEIC, max 10MB</p>
            </>
          )}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileChange(f);
            }}
          />
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-surface-container-low rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-sm">Posizione</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {latitude != null
                    ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}`
                    : "Clicca sulla mappa"}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.geolocation?.getCurrentPosition(
                    (pos) => {
                      setLatitude(pos.coords.latitude);
                      setLongitude(pos.coords.longitude);
                    },
                    () => {}
                  );
                }}
                className="ml-auto text-xs font-semibold text-primary flex items-center gap-1 hover:text-primary/80"
              >
                <span className="material-symbols-outlined text-sm">my_location</span>
                Posizione attuale
              </button>
            </div>
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onLocationSelect={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </div>

          <button
            onClick={() => {
              if (latitude != null && longitude != null) setStep(2);
              else setError("Seleziona una posizione sulla mappa.");
            }}
            className="w-full bg-vibrant-aura text-white font-bold py-3.5 rounded-full shadow-md active:scale-95 transition-transform"
          >
            Continua
          </button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Compass */}
          <div className="bg-surface-container-low rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">explore</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-sm">Direzione</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Verso dove punta la foto
                </p>
              </div>
            </div>
            <CompassPicker direction={direction} onChange={setDirection} />
          </div>

          {/* Date/time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Data e ora</span>
              </div>
              <input
                type="datetime-local"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                required
                className="w-full bg-surface-container-highest border-none rounded-sm py-3 px-3 text-sm font-medium focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>
            <div className="bg-surface-container-low rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm text-primary">thermostat</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tipo</span>
              </div>
              <select className="w-full bg-surface-container-highest border-none rounded-sm py-3 px-3 text-sm font-medium focus:ring-2 focus:ring-primary/40 focus:outline-none">
                <option>Arcobaleno</option>
                <option>Doppio arcobaleno</option>
                <option>Arcobaleno lunare</option>
                <option>Arcobaleno di nebbia</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface-container-low rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-sm text-primary">edit</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Descrizione (opzionale)</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Descrivi le nuvole, i colori, il momento..."
              className="w-full bg-surface-container-highest border-none rounded-sm py-3 px-3 text-sm placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
            />
          </div>

          {error && (
            <div className="bg-error-container rounded-lg p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-sm">error</span>
              <p className="text-sm text-on-error-container">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-vibrant-aura text-white font-bold py-3.5 rounded-full shadow-md active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">cloud_upload</span>
                Condividi con il mondo
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
