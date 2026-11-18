import type { MetadataRoute } from "next";
import { getPublicCollection } from "@/lib/api";

const SITE_URL = "https://portfolio-hub-psi-beige.vercel.app";

// Generate at request time so the sitemap is available independently of
// build-time API/database availability.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Project detail pages are optional: never let an API/database outage
  // prevent Google from fetching the main sitemap.
  try {
    const projects = await getPublicCollection("projects");
    for (const project of projects) {
      if (!project?.slug) continue;
      entries.push({
        url: `${SITE_URL}/projects/${encodeURIComponent(project.slug)}`,
        lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // Keep the homepage entry even when project data is unavailable.
  }

  return entries;
}
