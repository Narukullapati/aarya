export const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? ''

export interface GalleryImage {
  id: number
  ts: string
  category: string
  caption: string
  url: string
}

export function imageUrl(path: string): string {
  return `${API_BASE}${path}`
}

async function detail(r: Response): Promise<string> {
  const d = await r.json().catch(() => null)
  return (d && typeof d.detail === 'string' && d.detail) || `request failed: ${r.status}`
}

const TOKEN_KEY = 'aarya-edit-token'

export function getEditToken(): string {
  let t = sessionStorage.getItem(TOKEN_KEY)
  if (t === null) {
    t = window.prompt('password') ?? ''
    sessionStorage.setItem(TOKEN_KEY, t)
  }
  return t
}

export function clearEditToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

function editHeaders(): Record<string, string> {
  return { 'X-Edit-Token': getEditToken() }
}

async function checkEdit(r: Response) {
  if (r.status === 401) {
    clearEditToken()
    throw new Error('wrong password')
  }
  if (!r.ok) throw new Error(await detail(r))
}

export function fmtEst(ms: number): string {
  return new Date(ms).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export async function listImages(category: string): Promise<GalleryImage[]> {
  const r = await fetch(`${API_BASE}/api/images?category=${encodeURIComponent(category)}`)
  if (!r.ok) throw new Error(await detail(r))
  return (await r.json()).images
}

export async function uploadImage(
  category: string,
  caption: string,
  file: File,
): Promise<GalleryImage> {
  const fd = new FormData()
  fd.append('category', category)
  fd.append('caption', caption)
  fd.append('file', file)
  const r = await fetch(`${API_BASE}/api/images`, {
    method: 'POST',
    headers: editHeaders(),
    body: fd,
  })
  await checkEdit(r)
  return r.json()
}

export async function deleteImage(id: number): Promise<void> {
  const r = await fetch(`${API_BASE}/api/images/${id}`, {
    method: 'DELETE',
    headers: editHeaders(),
  })
  await checkEdit(r)
}

export interface TextPost {
  id: number
  ts: string
  ts_ms: number
  body: string
}

export async function listPosts(): Promise<TextPost[]> {
  const r = await fetch(`${API_BASE}/api/posts`)
  if (!r.ok) throw new Error(await detail(r))
  return (await r.json()).posts
}

export async function createPost(text: string): Promise<TextPost> {
  const r = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...editHeaders() },
    body: JSON.stringify({ text }),
  })
  await checkEdit(r)
  return r.json()
}

export async function deletePost(id: number): Promise<void> {
  const r = await fetch(`${API_BASE}/api/posts/${id}`, {
    method: 'DELETE',
    headers: editHeaders(),
  })
  await checkEdit(r)
}

export interface TimerState {
  running: boolean
  label?: string
  started_at_ms?: number
}

export async function getTimer(): Promise<TimerState> {
  const r = await fetch(`${API_BASE}/api/timer`)
  if (!r.ok) throw new Error(await detail(r))
  return r.json()
}

export async function startTimer(label: string): Promise<TimerState> {
  const r = await fetch(`${API_BASE}/api/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...editHeaders() },
    body: JSON.stringify({ label }),
  })
  await checkEdit(r)
  return r.json()
}

export async function stopTimer(): Promise<void> {
  const r = await fetch(`${API_BASE}/api/timer`, {
    method: 'DELETE',
    headers: editHeaders(),
  })
  await checkEdit(r)
}
