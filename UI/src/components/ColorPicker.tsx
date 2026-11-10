import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { hexToHsv, hsvToHex, storedHex, applySlot, type ThemeSlot } from '../theme'

export function ColorPicker({ slot }: { slot: ThemeSlot }) {
  const [hsv, setHsv] = useState(() => hexToHsv(storedHex(slot)))
  const [editing, setEditing] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  const hex = hsvToHex(hsv.h, hsv.s, hsv.v)

  useEffect(() => {
    applySlot(slot, hex)
  }, [slot, hex])

  function pickFromPointer(e: PointerEvent) {
    const box = boxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height)
    setHsv((p) => ({
      ...p,
      s: Math.round((x / rect.width) * 100),
      v: Math.round(100 - (y / rect.height) * 100),
    }))
  }

  function onPointerDown(e: PointerEvent) {
    boxRef.current?.setPointerCapture(e.pointerId)
    pickFromPointer(e)
  }

  function commitHex() {
    let val = (editing ?? '').trim()
    if (!val.startsWith('#')) val = '#' + val
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setHsv(hexToHsv(val.toLowerCase()))
    }
    setEditing(null)
  }

  return (
    <div className="color-picker">
      <div
        ref={boxRef}
        className="sv-box"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hsv.h}, 100%, 50%)`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => {
          if (e.buttons & 1) pickFromPointer(e)
        }}
      >
        <div
          className="sv-handle"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
        />
      </div>
      <input
        type="range"
        className="hue-slider"
        min={0}
        max={360}
        step={1}
        value={hsv.h}
        onChange={(e) => setHsv((p) => ({ ...p, h: Number(e.target.value) }))}
      />
      <div className="picker-row">
        <div className="swatch" style={{ background: hex }} />
        <input
          className="hex-input"
          maxLength={7}
          spellCheck={false}
          value={editing ?? hex}
          onChange={(e) => setEditing(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitHex()
          }}
        />
      </div>
    </div>
  )
}
