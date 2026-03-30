import exifr from "exifr";
import imageCompression from "browser-image-compression";

export type ExifData = {
  latitude: number | null;
  longitude: number | null;
  direction: number | null;
  takenAt: Date | null;
};

export async function extractExif(file: File): Promise<ExifData> {
  try {
    const exif = await exifr.parse(file, {
      gps: true,
      pick: ["GPSLatitude", "GPSLongitude", "GPSImgDirection", "DateTimeOriginal"],
    });

    if (!exif) return { latitude: null, longitude: null, direction: null, takenAt: null };

    return {
      latitude: exif.latitude ?? null,
      longitude: exif.longitude ?? null,
      direction: exif.GPSImgDirection != null ? Math.round(exif.GPSImgDirection) : null,
      takenAt: exif.DateTimeOriginal ?? null,
    };
  } catch {
    return { latitude: null, longitude: null, direction: null, takenAt: null };
  }
}

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
  });
}

export async function compressThumbnail(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 400,
    useWebWorker: true,
  });
}

export function compassLabel(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
