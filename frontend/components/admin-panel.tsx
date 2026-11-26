"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- content data is arbitrary JSON from the API */
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import type { ContentItem } from "@/types";
import { LogOut, Plus, Save, Trash2, Upload, RefreshCw, LockKeyhole, ChevronRight } from "lucide-react";

const sections = [
  { key: "profile", label: "Profile & About" },
  { key: "education", label: "Education" },
  { key: "experience", label: "Experience" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "achievements", label: "Achievements" },
  { key: "certificates", label: "Certificates" },
  { key: "resume", label: "Resume" },
  { key: "social-links", label: "Social links" },
  { key: "site-settings", label: "Site settings" },
];

const templates: Record<string, Record<string, any>> = {
  profile: { full_name: "Sonali Sharma", headline: "Developer · AI & ML Student", about: "", location: "Kolkata, West Bengal, India", email: "sonalisharma.s2006@gmail.com", github: "https://github.com/sonalisharmas2006-oss", linkedin: "https://www.linkedin.com/in/sonali-sharma-8b3885371", instagram: "https://www.instagram.com/cuddle_petalss/" },
  education: { institution: "", degree: "", start_year: "", end_year: "", grade: "", description: "" },
  experience: { organization: "", position: "", employment_type: "", location: "", start_date: "", end_date: "", currently_working: false, description: "" },
  skills: { name: "", category: "", description: "" },
  projects: { short_description: "", detailed_description: "", problem_statement: "", solution: "", technologies: [], github_url: "", demo_url: "", image_url: "", status: "In progress" },
  achievements: { event: "", position: "", date: "", prize: "", description: "", evidence_asset: "" },
  certificates: { issuer: "", issue_date: "", credential_id: "", credential_url: "", file_url: "", image_url: "", description: "" },
  resume: { file_url: "", version: "", uploaded_at: "", published: true },
  "social-links": { label: "", url: "", platform: "" },
  "site-settings": { site_title: "Sonali Sharma | Portfolio", site_description: "", canonical_domain: "", og_image: "" },
};

const MAX_UPLOAD_MB = 12;
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const ALLOWED_EXTENSIONS = [...IMAGE_EXTENSIONS, "pdf"];
const blank = (collection: string) => ({ slug: "new-entry", title: "New entry", data: templates[collection] || {}, is_published: false, is_featured: false, sort_order: 0 });

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function parseData(text: string): Record<string, any> {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return {};
  }
}

function uploadFieldsFor(collection: string, file: File, url: string): Record<string, string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isImage = IMAGE_EXTENSIONS.includes(extension);
  if (collection === "profile") return { profile_image: url };
  if (collection === "achievements") return { evidence_asset: url };
  if (collection === "projects") return { image_url: url };
  if (collection === "resume") return { file_url: url };
  if (collection === "certificates") return isImage ? { image_url: url, file_url: url } : { file_url: url };
  return { [isImage ? "image_url" : "file_url"]: url };
}

function DataFields({ data, onChange }: { data: Record<string, any>; onChange: (key: string, value: any) => void }) {
  return <div className="data-fields">{Object.entries(data).map(([key, value]) => {
    const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    if (typeof value === "boolean") return <label className="check-label" key={key}><input type="checkbox" checked={value} onChange={e => onChange(key, e.target.checked)} />{label}</label>;
    if (Array.isArray(value)) return <label key={key}>{label}<input value={value.join(", ")} onChange={e => onChange(key, e.target.value.split(",").map(x => x.trim()).filter(Boolean))} /><small>Separate multiple values with commas.</small></label>;
    if (typeof value === "string" && (value.length > 90 || /about|description|summary|problem|solution|objective/i.test(key))) return <label key={key}>{label}<textarea rows={4} value={value} onChange={e => onChange(key, e.target.value)} /></label>;
    if (typeof value === "object" && value !== null) return <label key={key}>{label}<textarea rows={4} value={JSON.stringify(value, null, 2)} onChange={e => { try { onChange(key, JSON.parse(e.target.value)); } catch { /* wait for valid JSON */ } }} /></label>;
    return <label key={key}>{label}<input value={value ?? ""} onChange={e => onChange(key, e.target.value)} /></label>;
  })}</div>;
}

export default function AdminPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loginLocked = useRef(false);
  const saveLocked = useRef(false);
  const removeLocked = useRef(false);
  const uploadLocked = useRef(false);
  const loadItemsRef = useRef<(next?: string) => Promise<void>>(async () => {});
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("sonali");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [collection, setCollection] = useState("profile");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [draft, setDraft] = useState<any>(blank("profile"));
  const [dataText, setDataText] = useState("{}");
  const [notice, setNotice] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");

  const loadItems = useCallback(async (next = collection) => {
    setBusy(true); setError("");
    try {
      const rows = await adminApi.list(next);
      setItems(rows); setSelected(null);
      setDraft(blank(next));
      setDataText(JSON.stringify(templates[next] || {}, null, 2));
    } catch (err) {
      setError(messageOf(err, "Could not load content."));
    } finally {
      setBusy(false);
    }
  }, [collection]);

  useEffect(() => {
    loadItemsRef.current = (next) => loadItems(next);
  }, [loadItems]);

  useEffect(() => {
    let active = true;
    adminApi.me()
      .then(() => {
        if (!active) return;
        setAuthenticated(true);
        return loadItemsRef.current("profile");
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, []);

  async function login(e: FormEvent) {
    e.preventDefault();
    if (loginLocked.current) return;
    loginLocked.current = true;
    setBusy(true); setError("");
    try {
      await adminApi.login(username, password);
      setAuthenticated(true); setPassword("");
      await loadItems(collection);
    } catch (err) {
      setError(messageOf(err, "Login failed."));
    } finally {
      loginLocked.current = false;
      setBusy(false);
    }
  }

  function choose(item: ContentItem) {
    setSelected(item); setDraft({ ...item });
    setDataText(JSON.stringify(item.data || {}, null, 2));
    setUploadUrl(""); setNotice(""); setError("");
  }

  function newItem() {
    setSelected(null); setDraft(blank(collection));
    setDataText(JSON.stringify(templates[collection] || {}, null, 2));
    setUploadUrl(""); setNotice(""); setError("");
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (saveLocked.current || uploading) return;
    saveLocked.current = true;
    setBusy(true); setError(""); setNotice("");
    try {
      const parsed = JSON.parse(dataText);
      const body = {
        slug: draft.slug, title: draft.title, data: parsed,
        is_published: !!draft.is_published, is_featured: !!draft.is_featured,
        sort_order: Number(draft.sort_order) || 0,
      };
      if (selected) {
        await adminApi.update(collection, selected.id, body);
        setNotice("Changes saved.");
      } else {
        await adminApi.create(collection, body);
        setNotice("New entry created.");
      }
      await loadItems(collection);
    } catch (err) {
      setError(messageOf(err, "Could not save. Check the JSON fields."));
    } finally {
      saveLocked.current = false;
      setBusy(false);
    }
  }

  async function remove() {
    if (!selected || removeLocked.current || uploading || !confirm(`Delete “${selected.title}”? This cannot be undone.`)) return;
    removeLocked.current = true;
    setBusy(true); setError(""); setNotice("");
    try {
      await adminApi.remove(collection, selected.id);
      setNotice("Entry deleted.");
      await loadItems(collection);
    } catch (err) {
      setError(messageOf(err, "Delete failed."));
    } finally {
      removeLocked.current = false;
      setBusy(false);
    }
  }

  async function upload(file?: File) {
    if (!file || uploadLocked.current) return;
    uploadLocked.current = true;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError("Invalid file type. Choose a PDF, PNG, JPG, JPEG or WEBP file.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`File too large. The limit is ${MAX_UPLOAD_MB} MB.`);
      return;
    }
    setUploading(true); setError(""); setNotice("");
    try {
      const result = await adminApi.upload(file);
      setUploadUrl(result.url);
      const fields = uploadFieldsFor(collection, file, result.url);
      setDataText(JSON.stringify({ ...parseData(dataText), ...fields }, null, 2));
      setNotice(`Uploaded ${result.filename}. ${Object.keys(fields).join(" and ")} set to the returned URL. Save changes to attach it.`);
    } catch (err) {
      setError(messageOf(err, "Upload failed."));
    } finally {
      uploadLocked.current = false;
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function logout() {
    try {
      await adminApi.logout();
    } catch (err) {
      setError(messageOf(err, "Sign out failed."));
    } finally {
      setAuthenticated(false); setItems([]);
    }
  }

  const parsedData = parseData(dataText);
  function patchData(key: string, value: any) {
    try {
      const next = JSON.parse(dataText || "{}");
      next[key] = value;
      setDataText(JSON.stringify(next, null, 2));
    } catch {
      setError("Please fix the advanced JSON before editing fields.");
    }
  }

  if (checking) return <main className="admin-screen"><div className="admin-login-card"><span className="eyebrow">THE PRIVATE STUDIO</span><h1>Opening your desk…</h1></div></main>;
  if (!authenticated) return <main className="admin-screen"><form className="admin-login-card" onSubmit={login}><div className="admin-lock"><LockKeyhole /></div><p className="eyebrow">SONALI’S PRIVATE STUDIO</p><h1>Welcome <em>back.</em></h1><p className="admin-muted">This little corner is just for you. Sign in to edit your portfolio.</p><label>Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></label>{error && <p className="admin-error">{error}</p>}<button className="button button-dark admin-submit" disabled={busy}>{busy ? "Signing in…" : "Enter my studio ↗"}</button><Link href="/" className="admin-back">← Back to portfolio</Link></form></main>;

  const uploadedIsImage = IMAGE_EXTENSIONS.some(ext => uploadUrl.toLowerCase().split("?")[0].endsWith(`.${ext}`));

  return <main className="admin-screen">
    <header className="admin-topbar"><Link href="/" className="monogram">SS<span>✳</span></Link><div><p className="eyebrow">PRIVATE CONTENT STUDIO</p><strong>Good to see you, Sonali.</strong></div><button className="button button-outline" onClick={logout}><LogOut size={15} /> Sign out</button></header>
    <div className="admin-layout">
      <aside className="admin-sidebar"><p className="eyebrow">YOUR CONTENT</p>{sections.map(s => <button key={s.key} className={collection === s.key ? "admin-nav active" : "admin-nav"} onClick={() => { setCollection(s.key); void loadItems(s.key); }}>{s.label}<ChevronRight size={15} /></button>)}<Link href="/" className="admin-back">↗ View public portfolio</Link></aside>
      <section className="admin-content">
        <div className="admin-heading"><div><p className="eyebrow">EDIT YOUR STORY</p><h1>{sections.find(s => s.key === collection)?.label}</h1><p className="admin-muted">Add, update, publish or remove content. Public pages show published entries only.</p></div><button className="button button-outline" onClick={() => loadItems()} disabled={busy || uploading}><RefreshCw size={15} /> Refresh</button></div>
        <div className="admin-workspace">
          <div className="admin-list-panel">
            <div className="admin-list-head"><strong>Entries ({items.length})</strong><button className="button button-small button-dark" onClick={newItem} disabled={busy || uploading}><Plus size={14} /> Add new</button></div>
            {items.map(item => <button key={item.id} className={`admin-entry ${selected?.id === item.id ? "selected" : ""}`} onClick={() => choose(item)}><span><strong>{item.title || item.slug}</strong><small>{item.slug}</small></span><i className={item.is_published ? "published-dot" : "draft-dot"} /></button>)}
            {!items.length && <p className="admin-empty">No entries yet. Add your first one.</p>}
          </div>
          <form className="admin-editor" onSubmit={save}>
            <div className="editor-head"><div><p className="eyebrow">{selected ? `EDITING #${selected.id}` : "NEW ENTRY"}</p><h2>{selected ? selected.title : "Create something new"}</h2></div>{selected && <button type="button" className="icon-danger" onClick={remove} title="Delete entry" disabled={busy || uploading}><Trash2 size={18} /></button>}</div>
            <label>Title<input required value={draft.title || ""} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
            <label>Slug<input required pattern="[A-Za-z0-9][A-Za-z0-9-]*" value={draft.slug || ""} onChange={e => setDraft({ ...draft, slug: e.target.value })} /></label>
            <div className="content-data-editor">
              <p className="eyebrow">DETAILS & PROFILE FIELDS</p>
              <DataFields data={parsedData} onChange={patchData} />
              <details className="advanced-json"><summary>Advanced JSON editor</summary><textarea className="json-editor" rows={12} spellCheck={false} value={dataText} onChange={e => setDataText(e.target.value)} /><small>For advanced fields, use the property names documented in docs/API_CONTRACT.md.</small></details>
            </div>
            <div className="upload-row">
              <label className="upload-label"><Upload size={15} /> {uploading ? "Uploading…" : "Upload a file"}<input ref={fileInputRef} type="file" aria-label="Upload file" accept=".pdf,.png,.jpg,.jpeg,.webp" disabled={uploading} onChange={e => upload(e.target.files?.[0])} /></label>
              {uploadUrl && <button type="button" className="button button-outline button-small" onClick={() => navigator.clipboard.writeText(uploadUrl)}>Copy uploaded URL</button>}
              {uploading && <span className="admin-muted">Uploading file…</span>}
              {uploadedIsImage && uploadUrl && <img src={uploadUrl} alt="Uploaded preview" style={{ maxWidth: 90, maxHeight: 60, border: "1px solid #c2a181", borderRadius: 4 }} />}
            </div>
            <div className="editor-flags">
              <label className="check-label"><input type="checkbox" checked={!!draft.is_published} onChange={e => setDraft({ ...draft, is_published: e.target.checked })} /> Published publicly</label>
              <label className="check-label"><input type="checkbox" checked={!!draft.is_featured} onChange={e => setDraft({ ...draft, is_featured: e.target.checked })} /> Feature on homepage</label>
              <label>Display order<input type="number" value={draft.sort_order ?? 0} onChange={e => setDraft({ ...draft, sort_order: e.target.value })} /></label>
            </div>
            {error && <p className="admin-error">{error}</p>}{notice && <p className="admin-notice">{notice}</p>}
            <button className="button button-dark admin-save" disabled={busy || uploading}><Save size={16} />{busy ? "Saving…" : uploading ? "Uploading…" : "Save changes"}</button>
          </form>
        </div>
      </section>
    </div>
    <footer className="admin-footer"><span>Private content studio · Sonali Sharma</span><span>Changes are saved to your portfolio API.</span></footer>
  </main>;
}
