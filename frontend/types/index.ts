export interface ContentItem {
  id:number; collection:string; slug:string; title:string; data:Record<string, any>;
  is_published:boolean; is_featured:boolean; sort_order:number; created_at:string; updated_at:string;
}
export interface ContactPayload {name:string;email:string;subject:string;message:string}
export interface PortfolioData {profile:ContentItem|null;skills:ContentItem[];projects:ContentItem[];achievements:ContentItem[];certificates:ContentItem[];resume:ContentItem|null;education:ContentItem[];experience:ContentItem[];socialLinks:ContentItem[]}
