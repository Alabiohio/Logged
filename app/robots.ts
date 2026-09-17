import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://logged.oheo.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/complete-profile",
        "/set-username",
        "/oheologgedadmin/",
        "/sdk-test/",
        "/offline",
        "/error/",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}