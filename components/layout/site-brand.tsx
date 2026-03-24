import { cn } from "@/lib/utils";

type SiteBrandProps = {
  logoUrl?: string | null;
  title: string;
  subtitle?: string;
  compactTitle?: string;
  iconClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

function getBrandMark(source: string) {
  const letters = source
    .split(/\s+/)
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 3)
    .join("")
    .toUpperCase();

  return letters || "ARR";
}

export function SiteBrand({
  logoUrl,
  title,
  subtitle,
  compactTitle,
  iconClassName,
  titleClassName,
  subtitleClassName,
}: SiteBrandProps) {
  const brandMark = getBrandMark(compactTitle ?? title);

  return (
    <>
      {logoUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={title}
            className={cn(
              "h-11 w-11 rounded-2xl border border-line bg-white object-cover",
              iconClassName,
            )}
          />
        </>
      ) : (
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-sm font-black tracking-[0.24em] text-white",
            iconClassName,
          )}
        >
          {brandMark}
        </div>
      )}
      <div>
        <p className={cn("font-display text-lg font-bold", titleClassName)}>
          {compactTitle ?? title}
        </p>
        {subtitle ? (
          <p className={cn("text-sm text-muted", subtitleClassName)}>{subtitle}</p>
        ) : null}
      </div>
    </>
  );
}
