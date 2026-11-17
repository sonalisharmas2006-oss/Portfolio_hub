
import PortfolioHome from "@/components/portfolio-home";
import { getPublicCollection } from "@/lib/api";
import type { PortfolioData } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    profile,
    skills,
    projects,
    achievements,
    certificates,
    resume,
    education,
    experience,
    socialLinks,
  ] = await Promise.all([
    getPublicCollection("profile"),
    getPublicCollection("skills"),
    getPublicCollection("projects"),
    getPublicCollection("achievements"),
    getPublicCollection("certificates"),
    getPublicCollection("resume"),
    getPublicCollection("education"),
    getPublicCollection("experience"),
    getPublicCollection("social-links"),
  ]);

  const data: PortfolioData = {
    profile: profile[0] ?? null,
    skills,
    projects,
    achievements,
    certificates,
    resume: resume[0] ?? null,
    education,
    experience,
    socialLinks,
  };

  return <PortfolioHome data={data} />;
}
