export interface ContentItem {
  id: number;
  collection: string;
  slug: string;
  title: string;
  data: Record<string, any>;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  full_name: string;
  headline: string;
  location: string;
  institution: string;
  degree: string;
  batch: string;
  about: string;
  email: string;
  github: string;
  linkedin: string;
  instagram: string;
  profile_image?: string;
}

export interface Project {
  short_description: string;
  detailed_description?: string;
  problem_statement?: string;
  solution?: string;
  technologies?: string[];
  github_url?: string;
  demo_url?: string;
  image_url?: string;
  status?: string;
}

export interface Achievement {
  event: string;
  position: string;
  date: string;
  prize?: string;
  description?: string;
  evidence_asset?: string;
  image_url?: string;
}

export interface Certificate {
  issuer?: string;
  issue_date?: string;
  credential_url?: string;
  file_url?: string;
  image_url?: string;
  description?: string;
}

export interface Skill {
  name: string;
  category: string;
  level?: string;
  icon?: string;
}
