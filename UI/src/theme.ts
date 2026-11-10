// ---------- theme slots ----------
// accent → --primary (green), main → --main (black background)
export const THEME = {
  accent: { key: 'aarya-accent', cssVar: '--primary', def: '#16a34a' },
  main: { key: 'aarya-main', cssVar: '--main', def: '#000000' },
} as const

export type ThemeSlot = keyof typeof THEME

export function storedHex(slot: ThemeSlot): string {
  return localStorage.getItem(THEME[slot].key) ?? THEME[slot].def
}

// ---------- front graphic ----------

export type Graphic = 'hexagons' | 'smileys'
const GRAPHIC_KEY = 'aarya-graphic'

export function storedGraphic(): Graphic {
  const g = localStorage.getItem(GRAPHIC_KEY)
  return g === 'smileys' || g === 'flames' ? 'smileys' : 'hexagons'
}

export function setGraphic(g: Graphic) {
  localStorage.setItem(GRAPHIC_KEY, g)
  retintBackdrop(storedHex('accent'))
}

// ---------- color math ----------

export function hsvToHex(h: number, s: number, v: number): string {
  s /= 100
  v /= 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r: number, g: number, b: number
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const to2 = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return '#' + to2(r) + to2(g) + to2(b)
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6)
    else if (max === g) h = 60 * ((b - r) / d + 2)
    else h = 60 * ((r - g) / d + 4)
  }
  if (h < 0) h += 360
  return {
    h: Math.round(h),
    s: max === 0 ? 0 : Math.round((d / max) * 100),
    v: Math.round(max * 100),
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// ---------- honeycomb backdrop ----------

function honeycombSvg(stroke: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='55.43' height='96' viewBox='0 0 55.43 96'>` +
    `<g fill='none' stroke='${stroke}' stroke-width='3' stroke-opacity='0.8'>` +
    `<path id='h' d='M0-32L27.71-16 27.71 16 0 32-27.71 16-27.71-16Z'/>` +
    `<use href='#h' x='-27.71' y='32'/><use href='#h' x='27.71' y='32'/>` +
    `<use href='#h' x='83.14' y='32'/><use href='#h' x='0' y='-16'/>` +
    `<use href='#h' x='55.43' y='-16'/><use href='#h' x='0' y='80'/>` +
    `<use href='#h' x='55.43' y='80'/></g></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// Nirvana-style smiley glyph (outline only): wobbly circle, X eyes, wavy
// smile with an end-tick, tongue loop hanging off the right side.
// Scattered at fixed pseudo-random spots inside a large tile, with wrapped
// copies at the edges so it tiles seamlessly without looking gridded.
const SMILEY_SPOTS: [number, number, number, number][] = [
  // x, y, rotation, scale — verified: no pair overlaps, even across tile wrap
  [63, 207, -22, 1.15],
  [116, 40, -14, 1.05],
  [198, 39, -8, 0.95],
  [146, 163, 4, 0.9],
  [159, 86, 11, 0.8],
  [8, 166, 18, 0.75],
  [212, 113, 25, 0.65],
]
const SMILEY_TILE = 220

function smileysSvg(stroke: string, glow: string): string {
  const glyph =
    `<g id='sm' fill='none' stroke-linecap='round' stroke-linejoin='round'>` +
    `<path d='M-29 2C-30-14-15-29 0-29C15-29 30-15 29 0C28 16 15 30-1 29C-17 28-29 17-29 2Z'/>` +
    `<path d='M-16-15L-6-5M-16-5L-6-15M6-16L16-4M6-4L16-16'/>` +
    `<path d='M-17 5L-17 11M-17 10Q-9 17-2 14T12 11'/>` +
    `<path d='M15 10C15 14 14 19 18 20C22 21 24 16 21 13C19 11 16 12 16 15'/>` +
    `</g>`
  const T = SMILEY_TILE
  let uses = ''
  for (const [x, y, r, s] of SMILEY_SPOTS) {
    for (const dx of [-T, 0, T]) {
      for (const dy of [-T, 0, T]) {
        const cx = x + dx
        const cy = y + dy
        if (cx + 44 > 0 && cx - 44 < T && cy + 44 > 0 && cy - 44 < T) {
          uses += `<use href='#sm' transform='translate(${cx} ${cy}) rotate(${r}) scale(${s})'/>`
        }
      }
    }
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${T}' height='${T}' viewBox='0 0 ${T} ${T}'>` +
    `<defs><filter id='b'><feGaussianBlur stdDeviation='1.2'/></filter>${glyph}</defs>` +
    `<g stroke='${glow}' stroke-width='3.5' filter='url(#b)' opacity='0.35'>${uses}</g>` +
    `<g stroke='${stroke}' stroke-width='3.5' stroke-opacity='0.8'>${uses}</g>` +
    `</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// Build the two backdrop layers (floor glow + tile pattern) for a graphic.
// Hexagon stroke is a slightly brighter accent; flame stroke is kept very dim
// (#003B20-ish) per the flames spec; the floor glow is the accent at 10%.
function backdropLayers(accent: string, graphic: Graphic) {
  const { h, s, v } = hexToHsv(accent)
  const [r, g, b] = hexToRgb(accent)
  const glow = `radial-gradient(ellipse 900px 420px at 50% 105%, rgba(${r}, ${g}, ${b}, 0.1), transparent 70%)`
  if (graphic === 'smileys') {
    const stroke = hsvToHex(h, Math.round(s * 0.95), Math.min(100, Math.round(v * 1.2)))
    return { image: `${glow}, ${smileysSvg(stroke, stroke)}`, size: 'auto, 220px 220px' }
  }
  const stroke = hsvToHex(h, Math.round(s * 0.95), Math.min(100, Math.round(v * 1.2)))
  return { image: `${glow}, ${honeycombSvg(stroke)}`, size: 'auto, 55.43px 96px' }
}

function retintBackdrop(accent: string) {
  const el = document.querySelector<HTMLElement>('.honeycomb')
  if (!el) return
  const { image, size } = backdropLayers(accent, storedGraphic())
  el.style.backgroundImage = image
  el.style.backgroundSize = size
}

// ---------- apply / init / reset ----------

function setThemeVars(accent: string, main: string) {
  const root = document.documentElement.style
  root.setProperty('--primary', accent)
  root.setProperty('--main', main)
  retintBackdrop(accent)
}

// Set CSS vars from storage. Safe pre-render (honeycomb retint no-ops until
// the element exists) — call again after mount to paint the grid.
export function initTheme() {
  setThemeVars(storedHex('accent'), storedHex('main'))
}

export function applySlot(slot: ThemeSlot, hex: string) {
  document.documentElement.style.setProperty(THEME[slot].cssVar, hex)
  localStorage.setItem(THEME[slot].key, hex)
  if (slot === 'accent') retintBackdrop(hex)
}

export function resetTheme() {
  localStorage.removeItem(THEME.accent.key)
  localStorage.removeItem(THEME.main.key)
  localStorage.removeItem(GRAPHIC_KEY)
  setThemeVars(THEME.accent.def, THEME.main.def)
}
