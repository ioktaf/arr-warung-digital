import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { recordSystemEvent } from "@/lib/system-events";
import { slugify } from "@/lib/utils";

const MAX_SOURCE_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_STORED_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 84;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

type AssetBucket = "brand-assets" | "product-images";

type UploadImageAssetInput = {
  file: File;
  bucket: AssetBucket;
  folder: string;
  nameHint: string;
};

type UploadImageAssetResult =
  | {
      ok: true;
      publicUrl: string;
      path: string;
    }
  | {
      ok: false;
      message: string;
    };

function getSafeFile(fileEntry: FormDataEntryValue | null) {
  if (!(fileEntry instanceof File)) {
    return null;
  }

  if (!fileEntry.size) {
    return null;
  }

  return fileEntry;
}

function getFileExtension(file: File) {
  const fromType = EXTENSION_BY_TYPE[file.type];

  if (fromType) {
    return fromType;
  }

  const rawName = file.name.trim();
  const lastDot = rawName.lastIndexOf(".");

  if (lastDot === -1) {
    return "png";
  }

  return rawName.slice(lastDot + 1).toLowerCase() || "png";
}

async function prepareImageUpload(file: File) {
  if (file.size > MAX_SOURCE_IMAGE_SIZE) {
    return {
      ok: false as const,
      message: "Ukuran file maksimal 8 MB sebelum diproses.",
    };
  }

  const sourceBuffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    if (sourceBuffer.byteLength > MAX_STORED_IMAGE_SIZE) {
      return {
        ok: false as const,
        message: "Ukuran gambar SVG/GIF maksimal 5 MB.",
      };
    }

    return {
      ok: true as const,
      buffer: new Uint8Array(sourceBuffer),
      contentType: file.type,
      extension: getFileExtension(file),
    };
  }

  try {
    const sharp = (await import("sharp")).default;
    const transformedBuffer = await sharp(sourceBuffer)
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    if (transformedBuffer.byteLength > MAX_STORED_IMAGE_SIZE) {
      return {
        ok: false as const,
        message:
          "Gambar masih terlalu besar setelah diproses. Coba gunakan gambar yang lebih ringan.",
      };
    }

    return {
      ok: true as const,
      buffer: new Uint8Array(transformedBuffer),
      contentType: "image/webp",
      extension: "webp",
    };
  } catch (error) {
    await recordSystemEvent({
      source: "storage-assets",
      severity: "warning",
      message: "Optimasi gambar gagal, memakai file asli sebagai fallback.",
      details: {
        fileType: file.type,
        fileName: file.name,
        error: error instanceof Error ? error.message : "unknown-error",
      },
    });

    if (sourceBuffer.byteLength > MAX_STORED_IMAGE_SIZE) {
      return {
        ok: false as const,
        message:
          "Gambar terlalu besar dan gagal diproses otomatis. Coba kompres dulu lalu upload ulang.",
      };
    }

    return {
      ok: true as const,
      buffer: new Uint8Array(sourceBuffer),
      contentType: file.type,
      extension: getFileExtension(file),
    };
  }
}

function buildAssetPath(folder: string, nameHint: string, extension: string) {
  const safeName = slugify(nameHint) || "asset";
  return `${folder}/${safeName}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

async function uploadImageAsset({
  file,
  bucket,
  folder,
  nameHint,
}: UploadImageAssetInput): Promise<UploadImageAssetResult> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      message:
        "Format gambar belum didukung. Pakai JPG, PNG, WEBP, GIF, atau SVG.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      message:
        "Upload gambar butuh Supabase live aktif. Isi env Supabase dulu lalu coba lagi.",
    };
  }

  const preparedImage = await prepareImageUpload(file);

  if (!preparedImage.ok) {
    return preparedImage;
  }

  const path = buildAssetPath(folder, nameHint, preparedImage.extension);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, preparedImage.buffer, {
      contentType: preparedImage.contentType,
      upsert: false,
    });

  if (error) {
    console.error(`Failed to upload ${bucket} asset`, error.message);
    await recordSystemEvent({
      source: "storage-assets",
      severity: "error",
      message: `Upload asset ke bucket ${bucket} gagal.`,
      details: {
        bucket,
        path,
        error: error.message,
      },
    });
    return {
      ok: false,
      message: "Upload gambar gagal. Coba lagi sebentar.",
    };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    ok: true,
    publicUrl: data.publicUrl,
    path,
  };
}

export function getImageFile(formData: FormData, fieldName: string) {
  return getSafeFile(formData.get(fieldName));
}

export async function uploadBrandLogo(file: File, brandName: string) {
  return uploadImageAsset({
    file,
    bucket: "brand-assets",
    folder: "logos",
    nameHint: brandName || "website-logo",
  });
}

export async function uploadProductImage(file: File, productName: string) {
  return uploadImageAsset({
    file,
    bucket: "product-images",
    folder: "products",
    nameHint: productName || "product-image",
  });
}
