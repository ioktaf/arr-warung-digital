import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Database,
  ShieldCheck,
} from "lucide-react";

import { CatalogBrowser } from "@/components/store/catalog-browser";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCatalogProducts, getStoreSettings } from "@/lib/data";
import {
  hasPublicSupabaseEnv,
  hasServiceRoleSupabaseEnv,
} from "@/lib/supabase/env";

export default async function StorefrontPage() {
  const products = await getCatalogProducts();
  const settings = await getStoreSettings();
  const publicEnvReady = hasPublicSupabaseEnv();
  const serviceEnvReady = hasServiceRoleSupabaseEnv();
  const lowStockProducts = products.filter((product) => product.stock <= 10).length;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-accent to-brand" />
          <div className="max-w-3xl space-y-6">
            <Badge tone="accent">{settings.heroBadge}</Badge>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {settings.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                {settings.heroDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="#produk"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                {settings.heroPrimaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
              >
                {settings.heroSecondaryCtaLabel}
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="grid-pattern">
            <div className="flex items-center justify-between">
              <Database className="h-5 w-5 text-brand" />
              <Badge tone={publicEnvReady ? "brand" : "accent"}>
                {publicEnvReady ? "Live Catalog" : "Demo Catalog"}
              </Badge>
            </div>
            <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
              {settings.catalogStatusLabel}
            </p>
            <p className="mt-2 text-3xl font-black">{products.length} produk</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {settings.catalogStatusDescription}
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <BellRing className="h-5 w-5 text-accent" />
              <Badge tone={serviceEnvReady ? "brand" : "accent"}>
                {serviceEnvReady ? "Ready" : "Setup Needed"}
              </Badge>
            </div>
            <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
              {settings.workflowStatusLabel}
            </p>
            <p className="mt-2 text-3xl font-black">
              {serviceEnvReady ? "Semi-Auto Live" : "Preview Mode"}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {settings.workflowStatusDescription}
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <ShieldCheck className="h-5 w-5 text-success" />
              <Badge>{lowStockProducts} low stock</Badge>
            </div>
            <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
              {settings.operationsStatusLabel}
            </p>
            <p className="mt-2 text-3xl font-black">{settings.operationsStatusTitle}</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {settings.operationsStatusDescription}
            </p>
          </Card>
        </div>
      </section>

      <section
        id="cara-kerja"
        className="mt-16"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge>{settings.workflowBadge}</Badge>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{settings.workflowTitle}</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            {settings.workflowDescription}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {settings.workflowSteps.map((step, index) => (
            <Card
              key={step.title}
              className="relative"
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge tone="brand">Step {index + 1}</Badge>
                <CheckCircle2 className="h-5 w-5 text-brand" />
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="produk"
        className="mt-16"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge tone="brand">{settings.catalogBadge}</Badge>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{settings.catalogTitle}</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            {settings.catalogDescription}
          </p>
        </div>

        <CatalogBrowser products={products} />
      </section>

      <section className="mt-16 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <Badge tone="accent">{settings.stackBadge}</Badge>
          <div className="mt-5 space-y-4">
            {settings.stackHighlights.map((item) => (
              <div
                key={item}
                className="flex gap-3"
              >
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-sm leading-7 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Badge>{settings.dashboardBadge}</Badge>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {settings.dashboardNotes.map((note) => (
              <div
                key={note}
                className="rounded-[22px] border border-line bg-white/60 p-4"
              >
                <p className="text-sm leading-7 text-muted">{note}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
