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
  const r = await fetch(`${API_BASE}/api/images`, { method: 'POST', body: fd })
  if (!r.ok) throw new Error(await detail(r))
  return r.json()
}

export async function deleteImage(id: number): Promise<void> {
  const r = await fetch(`${API_BASE}/api/images/${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error(await detail(r))
}
