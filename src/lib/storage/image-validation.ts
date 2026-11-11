export const maximumImageBytes = 5 * 1024 * 1024;
export const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export async function validateImageFile(file: File): Promise<string | null> {
  if (file.size > maximumImageBytes) {
    return "Images must be 5 MiB or smaller.";
  }

  if (!Object.hasOwn(allowedImageTypes, file.type)) {
    return "Use a JPEG, PNG, or WebP image.";
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";

  if (
    (file.type === "image/jpeg" && !isJpeg) ||
    (file.type === "image/png" && !isPng) ||
    (file.type === "image/webp" && !isWebp)
  ) {
    return "The selected file does not match its image type.";
  }

  return null;
}

export function getImageExtension(mimeType: string): string | null {
  return (
    Object.entries(allowedImageTypes).find(
      ([allowedType]) => allowedType === mimeType,
    )?.[1] ?? null
  );
}
