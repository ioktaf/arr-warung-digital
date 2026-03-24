import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      ok: false,
      message: "Ukuran gambar maksimal 5 MB.",
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

  const path = buildAssetPath(folder, nameHint, getFileExtension(file));
  const fileBuffer = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(path, fileBuffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error(`Failed to upload ${bucket} asset`, error.message);
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
