import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://logged.oheo.site";

const publicRoutes = [
  "/",
  "/features",
  "/api-reference",
  "/dashboard",
  "/changelog",
  "/feedback",
  "/login",
  "/register",
  "/privacy",
  "/status",
  "/terms",
  "/docs",
  "/docs/installation",
  "/docs/quick-start",
  "/docs/rest-api",
  "/docs/sdk",
  "/docs/sdk/auto",
  "/docs/sdk/capture",
  "/docs/sdk/configuration",
  "/docs/sdk/console",
  "/docs/examples",
  "/docs/examples/javascript",
  "/docs/examples/nextjs",
  "/docs/examples/react",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/docs") ? 0.8 : 0.6,
  }));
}