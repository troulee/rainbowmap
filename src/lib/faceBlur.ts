import * as faceapi from "face-api.js";

let modelsLoaded = false;

async function ensureModels() {
  if (modelsLoaded) return;
  const MODEL_URL = "/models";
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  modelsLoaded = true;
}

export type FaceDetectionResult = {
  facesFound: number;
  blurredFile: File | null;
};

export async function detectAndBlurFaces(file: File): Promise<FaceDetectionResult> {
  await ensureModels();

  const img = await createImageElement(file);
  const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.4,
  }));

  if (detections.length === 0) {
    return { facesFound: 0, blurredFile: null };
  }

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  for (const detection of detections) {
    const { x, y, width, height } = detection.box;
    // Expand the region slightly for better coverage
    const pad = Math.max(width, height) * 0.15;
    const bx = Math.max(0, x - pad);
    const by = Math.max(0, y - pad);
    const bw = Math.min(canvas.width - bx, width + pad * 2);
    const bh = Math.min(canvas.height - by, height + pad * 2);

    // Extract face region, scale down, then scale back up for pixelated blur
    const faceCanvas = document.createElement("canvas");
    const pixelSize = 8;
    faceCanvas.width = pixelSize;
    faceCanvas.height = pixelSize;
    const faceCtx = faceCanvas.getContext("2d")!;
    faceCtx.drawImage(canvas, bx, by, bw, bh, 0, 0, pixelSize, pixelSize);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(faceCanvas, 0, 0, pixelSize, pixelSize, bx, by, bw, bh);
    ctx.imageSmoothingEnabled = true;
  }

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
  );
  const blurredFile = new File([blob], file.name, { type: "image/jpeg" });

  return { facesFound: detections.length, blurredFile };
}

function createImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
