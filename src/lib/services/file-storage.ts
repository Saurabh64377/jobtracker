import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const MIME_TO_CLOUDINARY: Record<string, { resourceType: "image" | "raw"; format: string }> = {
  "application/pdf": { resourceType: "raw", format: "pdf" },
  "application/msword": { resourceType: "raw", format: "doc" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { resourceType: "raw", format: "docx" },
  "image/png": { resourceType: "image", format: "png" },
  "image/jpeg": { resourceType: "image", format: "jpg" },
};

function cloudinaryInfo(mimeType: string | null) {
  return (mimeType && MIME_TO_CLOUDINARY[mimeType]) || { resourceType: "raw" as const, format: "bin" };
}

/** File extension (without dot) Cloudinary stored the asset under, for building a download filename. */
export function extensionForMimeType(mimeType: string | null): string {
  return cloudinaryInfo(mimeType).format;
}

/**
 * Uploads to Cloudinary as a **private** asset (not publicly reachable by
 * URL) — every download must go through readStoredFile(), which generates a
 * short-lived signed URL server-side. Returns the Cloudinary public_id,
 * stored as the record's `fileUrl`.
 */
export async function saveFile(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
  const { resourceType } = cloudinaryInfo(mimeType);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        type: "private",
        folder,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.public_id);
      },
    );
    stream.end(buffer);
  });
}

/** Fetches the file bytes via a short-lived signed Cloudinary URL. */
export async function readStoredFile(publicId: string, mimeType: string | null): Promise<Buffer> {
  const { resourceType, format } = cloudinaryInfo(mimeType);

  const url = cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: "private",
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch stored file (status ${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function deleteStoredFile(publicId: string, mimeType: string | null): Promise<void> {
  const { resourceType } = cloudinaryInfo(mimeType);
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type: "private" }).catch(() => {});
}
