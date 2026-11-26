import type { ContentItem, ContactPayload } from "@/types";

export const PRODUCTION_API_BASE_URL = "https://sonali-portfolio-api.onrender.com";

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "").replace(/\/api\/v1\/?$/i, "");
}

function isLocalUrl(value: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value);
}

const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
const useConfiguredBase = !(
  process.env.NODE_ENV === "production" && isLocalUrl(configuredBase)
);
export const API_BASE = normalizeBaseUrl(
  useConfiguredBase && configuredBase ? configuredBase : PRODUCTION_API_BASE_URL
);
export const API_V1 = `${API_BASE}/api/v1`;

export class ApiError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function detailText(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const candidate = (body as { detail?: unknown; message?: unknown }).detail
    ?? (body as { message?: unknown }).message;
  if (candidate == null) return "";
  if (typeof candidate === "string") return candidate;
  try {
    return JSON.stringify(candidate);
  } catch {
    return String(candidate);
  }
}

function withStatus(message: string, status: number, detail = ""): string {
  const suffix = detail ? `: ${detail}` : "";
  return `${message} (HTTP ${status}${suffix})`;
}

function httpError(status: number, body: unknown): ApiError {
  const detail = detailText(body);
  if (status === 401) {
    const message = /invalid username|password/i.test(detail)
      ? "Invalid username or password."
      : "Authentication expired. Please sign in again.";
    return new ApiError(withStatus(message, status, detail), status, body);
  }
  if (status === 403) {
    return new ApiError(withStatus("You do not have permission for this action.", status, detail), status, body);
  }
  if (status === 404) {
    return new ApiError(withStatus("The requested item was not found.", status, detail), status, body);
  }
  if (status === 409) {
    return new ApiError(withStatus("That entry conflicts with an existing one.", status, detail), status, body);
  }
  if (status === 413) {
    return new ApiError(withStatus("File too large. Please choose a smaller file.", status, detail), status, body);
  }
  if (status === 415) {
    return new ApiError(withStatus("Invalid file type. Use PDF, PNG, JPG or WEBP.", status, detail), status, body);
  }
  if (status === 422) {
    return new ApiError(withStatus("Validation error. Check the fields and JSON data.", status, detail), status, body);
  }
  if (status === 503) {
    return new ApiError(withStatus("Storage configuration missing on the backend.", status, detail), status, body);
  }
  if (status >= 500) {
    return new ApiError(withStatus("Backend unavailable. Please retry shortly.", status, detail), status, body);
  }
  return new ApiError(withStatus(detail || "Request failed", status), status, body);
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const name = typeof DOMException !== "undefined" && error instanceof DOMException
    ? error.name
    : (error as { name?: string } | null)?.name;
  const message = error instanceof Error ? error.message : String(error);
  if (name === "TimeoutError" || /timed?\s?out/i.test(message)) {
    return new ApiError("Backend unavailable or too slow to respond. Please retry in a moment.", 504);
  }
  if (/fetch failed|failed to fetch|network|load failed/i.test(message)) {
    return new ApiError("Network or CORS error: the backend could not be reached. Check your connection and try again.", 0);
  }
  return new ApiError(message || "Unexpected request error");
}

type RequestOptions = RequestInit & { timeoutMs?: number };

async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const { timeoutMs, ...fetchInit } = init;
  const method = (fetchInit.method || "GET").toUpperCase();
  const isUpload = typeof FormData !== "undefined" && fetchInit.body instanceof FormData;
  const timeout = timeoutMs ?? (isUpload ? 120_000 : 45_000);
  const attempts = method === "GET" ? 3 : 1;
  let lastError = new ApiError("Request failed");

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${API_V1}${path}`, {
        ...fetchInit,
        cache: "no-store",
        credentials: fetchInit.credentials ?? "include",
        signal: fetchInit.signal ?? AbortSignal.timeout(timeout),
      });
      const text = await response.text();
      let body: unknown = null;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = { message: text.slice(0, 300) };
        }
      }
      if (!response.ok) throw httpError(response.status, body);
      // JSON `null` is a valid response for empty profile/resume collections.
      return body as T;
    } catch (error) {
      lastError = normalizeError(error);
      const retryable = lastError.status === 0 || (lastError.status ?? 0) >= 500;
      if (!retryable || attempt === attempts - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

export function resolveAssetUrl(value?: string | null): string | null {
  if (!value) return null;
  if (/^(https?:\/\/|data:)/i.test(value)) return value;
  if (value.startsWith("/assets/")) return value;
  return `${API_BASE}${value.startsWith("/") ? "" : "/"}${value}`;
}

export const publicApi = {
  collection: (name: string) => request<ContentItem[] | ContentItem | null>(`/${name}`),
  project: (slug: string) => request<ContentItem>(`/projects/${encodeURIComponent(slug)}`),
  contact: (payload: ContactPayload) => request<{ accepted: boolean; email_status: string; message?: string }>(
    "/contact",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
  ),
};

export const adminApi = {
  login: (username: string, password: string) => request<{ authenticated: boolean; username: string }>(
    "/admin/login",
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }
  ),
  logout: () => request<{ authenticated: boolean }>("/admin/logout", { method: "POST", credentials: "include" }),
  me: () => request<{ authenticated: boolean; username: string }>("/admin/me", { credentials: "include" }),
  list: (collection: string) => request<ContentItem[]>(`/admin/${collection}`, { credentials: "include" }),
  create: (collection: string, body: Partial<ContentItem>) => request<ContentItem>(`/admin/${collection}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
  update: (collection: string, id: number, body: Partial<ContentItem>) => request<ContentItem>(`/admin/${collection}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
  patch: (collection: string, id: number, body: Partial<ContentItem>) => request<ContentItem>(`/admin/${collection}/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
  remove: (collection: string, id: number) => request<{ deleted: boolean }>(`/admin/${collection}/${id}`, {
    method: "DELETE",
    credentials: "include",
  }),
  // FormData must be passed as-is so the browser sets the multipart boundary.
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ filename: string; original_filename: string; url: string; size: number; storage: string }>(
      "/admin/upload",
      { method: "POST", credentials: "include", body: form }
    );
  },
};

export async function getPublicCollection(name: string): Promise<ContentItem[]> {
  try {
    const value = await publicApi.collection(name);
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  } catch (error) {
    // Public pages keep their existing visual fallbacks, but failures are visible
    // in logs instead of being silently swallowed.
    console.warn(`[api] Could not load public collection "${name}":`, error);
    return [];
  }
}
