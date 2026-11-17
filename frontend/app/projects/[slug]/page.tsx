import type { Metadata } from "next";
import Link from "next/link";
import { publicApi, resolveAssetUrl } from "@/lib/api";
export const dynamic = "force-dynamic";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;
  try {const item=await publicApi.project(slug);return {title:item.title,description:item.data?.short_description || item.data?.description || "Project by Sonali Sharma",alternates:{canonical:`/projects/${slug}`}};} catch{return {title:"Project not found",robots:{index:false,follow:false}};}
}
export default async function ProjectPage({params}:Props){
 const {slug}=await params; let item=null; try{item=await publicApi.project(slug);}catch{}
 if(!item)return <main className="not-found"><p className="eyebrow">A little detour</p><h1>Project not found</h1><Link href="/">Return to portfolio ↗</Link></main>;
 const d=item.data||{}; const image=resolveAssetUrl(d.image_url);
 return <main className="project-detail"><Link href="/#work" className="back-link">← Back to work</Link><p className="eyebrow">Selected work / {d.status||"Project"}</p><h1>{item.title}</h1><p className="project-lead">{d.short_description||d.description}</p>{image&&<img src={image} alt={`${item.title} project preview`} className="detail-image"/>}<div className="detail-copy"><h2>The idea</h2><p>{d.problem_statement||"Project details are being updated."}</p><h2>What I built</h2><p>{d.solution||d.detailed_description||d.description||"More details will be added soon."}</p>{Array.isArray(d.technologies)&&<div className="tag-row">{d.technologies.map((x:string)=><span className="tag" key={x}>{x}</span>)}</div>}{d.github_url&&<a className="button button-dark" href={d.github_url} target="_blank" rel="noreferrer">Explore repository ↗</a>}</div></main>;
}
