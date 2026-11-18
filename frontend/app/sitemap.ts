import type { MetadataRoute } from "next";
import { getPublicCollection } from "@/lib/api";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=process.env.NEXT_PUBLIC_SITE_URL||"https://portfolio-hub-psi-beige.vercel.app";
 const projects=await getPublicCollection("projects");
 return [{url:base,lastModified:new Date(),changeFrequency:"weekly",priority:1},...projects.map(p=>({url:`${base}/projects/${p.slug}`,lastModified:new Date(p.updated_at),changeFrequency:"monthly" as const,priority:.7}))];
}
