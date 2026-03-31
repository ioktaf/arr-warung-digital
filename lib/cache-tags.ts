import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  storeSettings: "store-settings",
  catalogProducts: "catalog-products",
  productSlugPrefix: "product-slug:",
} as const;

export function getProductCacheTag(slug: string) {
  return `${CACHE_TAGS.productSlugPrefix}${slug.trim().toLowerCase()}`;
}

export function revalidatePublicCatalogCache(productSlugs: Array<string | null | undefined> = []) {
  revalidateTag(CACHE_TAGS.catalogProducts, "max");

  const normalizedSlugs = Array.from(
    new Set(
      productSlugs
        .map((slug) => slug?.trim().toLowerCase())
        .filter((slug): slug is string => Boolean(slug)),
    ),
  );

  normalizedSlugs.forEach((slug) => {
    revalidateTag(getProductCacheTag(slug), "max");
  });
}

export function revalidateStoreSettingsCache() {
  revalidateTag(CACHE_TAGS.storeSettings, "max");
}
