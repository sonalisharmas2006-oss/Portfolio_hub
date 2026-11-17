import type { MetadataRoute } from "next";
import { getPublicCollection } from "@/lib/api";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=process.env.NEXT_PUBLIC_SITE_URL||"http://127.0.0.1:3000";
 const projects=await getPublicCollection("projects");
 return [{url:base,lastModified:new Date(),changeFrequency:"weekly",priority:1},...projects.map(p=>({url:`${base}/projects/${p.slug}`,lastModified:new Date(p.updated_at),changeFrequency:"monthly" as const,priority:.7}))];
}
