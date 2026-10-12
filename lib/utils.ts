import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks whether a given photo URL is empty or the legacy 350x350 thumbnail crop.
 * Returns true if empty or the legacy low-res thumbnail, false if it's a high-res crop or valid image URL.
 */
export function isLegacyLowResPhoto(url: string | undefined | null): boolean {
  if (!url) return true;
  // If not a data URL, it's an external URL, local asset path (e.g. /me.jpeg), or storage URL
  if (!url.startsWith("data:image/jpeg;base64,")) {
    return false;
  }

  try {
    const rawB64 = url.slice(23, 1500);
    const binary =
      typeof window !== "undefined" && typeof window.atob === "function"
        ? window.atob(rawB64)
        : typeof Buffer !== "undefined"
        ? Buffer.from(rawB64, "base64").toString("binary")
        : "";

    if (!binary) return url.length < 50000;

    let offset = 2;
    while (offset < binary.length - 8) {
      if (binary.charCodeAt(offset) !== 0xff) break;
      const marker = binary.charCodeAt(offset + 1);
      const len = (binary.charCodeAt(offset + 2) << 8) | binary.charCodeAt(offset + 3);
      if (marker === 0xc0 || marker === 0xc2) {
        const h = (binary.charCodeAt(offset + 5) << 8) | binary.charCodeAt(offset + 6);
        const w = (binary.charCodeAt(offset + 7) << 8) | binary.charCodeAt(offset + 8);
        // Exact legacy thumbnail check:
        // Prior to the fix, PhotoCropModal hardcoded tempCanvas.width = 350 and height = 350.
        // We match this specific 350x350 thumbnail (or legacy 400x400 square crop under 50KB).
        return (w === 350 && h === 350) || (w <= 400 && h <= 400 && url.length < 50000);
      }
      offset += 2 + len;
    }
  } catch (e) {
    return url.length < 45000;
  }
  return false;
}
