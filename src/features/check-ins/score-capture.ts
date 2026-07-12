"use client";
export async function loadCapture(dataUrl: string): Promise<HTMLCanvasElement> {
  const image = new Image(); await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("The captured photo could not be decoded.")); image.src = dataUrl; });
  const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; const context = canvas.getContext("2d", { willReadFrequently: true }); if (!context) throw new Error("2D canvas context is unavailable."); context.drawImage(image, 0, 0); return canvas;
}
