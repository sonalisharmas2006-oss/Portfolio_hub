import type { ContentItem, ContactPayload } from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_V1 = `${API_BASE}/api/v1`;

export function resolveAssetUrl(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/assets/")) return value;
  return `${API_BASE}${value.startsWith("/") ? "" : "/"}${value}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_V1}${path}`, {
  ...init,
  cache: "no-store",
  signal: init.signal ?? AbortSignal.timeout(12000),
});
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.detail || body?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export const publicApi = {
  collection: (name: string) => request<ContentItem[] | ContentItem | null>(`/${name}`),
  project: (slug: string) => request<ContentItem>(`/projects/${encodeURIComponent(slug)}`),
  contact: (payload: ContactPayload) => request<{accepted:boolean; email_status:string; message?:string}>("/contact", {
    method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload)
  })
};

export const adminApi = {
  login: (username: string, password: string) => request<{authenticated:boolean; username:string}>("/admin/login", {
    method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username,password})
  }),
  logout: () => request<{authenticated:boolean}>("/admin/logout", {method:"POST",credentials:"include"}),
  me: () => request<{authenticated:boolean;username:string}>("/admin/me", {credentials:"include"}),
  list: (collection:string) => request<ContentItem[]>(`/admin/${collection}`, {credentials:"include"}),
  create: (collection:string, body:Partial<ContentItem>) => request<ContentItem>(`/admin/${collection}`, {method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),
  update: (collection:string,id:number,body:Partial<ContentItem>) => request<ContentItem>(`/admin/${collection}/${id}`, {method:"PUT",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),
  remove: (collection:string,id:number) => request<{deleted:boolean}>(`/admin/${collection}/${id}`, {method:"DELETE",credentials:"include"}),
  upload: async (file:File) => {
    const form = new FormData(); form.append("file",file);
    return request<{filename:string;url:string;size:number}>("/admin/upload", {method:"POST",credentials:"include",body:form});
  }
};

export async function getPublicCollection(name:string): Promise<ContentItem[]> {
  try {
    const value = await publicApi.collection(name);
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  } catch { return []; }
}
export { API_BASE };
