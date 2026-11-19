import { getTextOverrides, saveTextOverrides } from './api'

let overrides: Record<string, string> = {}
let observerStarted = false

export function getOverrides() {
  return overrides
}

export async function loadOverrides() {
  try {
    overrides = await getTextOverrides()
  } catch {
    overrides = {}
  }
  applyOverrides()
}

export function recordOverride(key: string, value: string) {
  if (!value || value === key) return
  overrides = { ...overrides, [key]: value }
  applyOverrides()
}

export async function saveOverrides() {
  await saveTextOverrides(overrides)
}

export function applyOverrides() {
  if (typeof document === 'undefined') return
  if (!Object.keys(overrides).length) return
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const el = node.parentElement
    if (!el) continue
    if (
      el.closest('script,style,svg,input,textarea,[contenteditable="true"]')
    )
      continue
    const text = node.nodeValue ?? ''
    const trimmed = text.trim()
    if (!trimmed) continue
    const val = overrides[trimmed]
    if (val === undefined) continue
    const at = text.indexOf(trimmed)
    node.nodeValue =
      text.slice(0, at) + val + text.slice(at + trimmed.length)
  }
}

let scheduled = false
export function startOverrideObserver() {
  if (observerStarted || typeof document === 'undefined') return
  observerStarted = true
  const mo = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    window.setTimeout(() => {
      scheduled = false
      applyOverrides()
    }, 60)
  })
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  })
}

export function findEditableTextNode(root: HTMLElement): {
  node: Text
  el: HTMLElement
  original: string
} | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let n: Node | null
  while ((n = walker.nextNode())) {
    const original = (n.nodeValue ?? '').trim()
    const el = n.parentElement
    if (!original || !el) continue
    if (el.closest('script,style,svg')) continue
    return { node: n as Text, el, original }
  }
  return null
}

export function beginTextEdit(root: HTMLElement): boolean {
  const found = findEditableTextNode(root)
  if (!found) return false
  const { node, el, original } = found
  node.nodeValue = original
  el.contentEditable = 'true'
  el.focus()
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)

  let cancelled = false
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') {
      ev.preventDefault()
      el.blur()
    } else if (ev.key === 'Escape') {
      cancelled = true
      el.blur()
    }
  }
  const onBlur = () => {
    el.removeEventListener('keydown', onKey)
    el.contentEditable = 'false'
    const val = cancelled ? '' : (node.nodeValue ?? '').trim()
    if (!cancelled && val && val !== original) {
      node.nodeValue = val
      recordOverride(original, val)
    } else {
      node.nodeValue = original
    }
    applyOverrides()
  }
  el.addEventListener('blur', onBlur)
  el.addEventListener('keydown', onKey)
  return true
}
