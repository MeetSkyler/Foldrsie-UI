"use client";
import { useEffect, useRef, useState } from "react";

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  const toHex = (n: number) => Math.round(f(n) * 255).toString(16).padStart(2, "0");
  return `#${toHex(5)}${toHex(3)}${toHex(1)}`.toUpperCase();
}

function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
  const m = hex.trim().replace(/^#/, "").match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s: s * 100, v: v * 100 };
}

export default function ColorPickerModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (hex: string) => void;
}) {
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(12);
  const [val, setVal] = useState(85);
  const [hexText, setHexText] = useState(() => hsvToHex(0, 12, 85));
  const [copied, setCopied] = useState(false);

  const squareRef = useRef<HTMLDivElement | null>(null);
  const hueRef = useRef<HTMLDivElement | null>(null);
  const draggingSquare = useRef(false);
  const draggingHue = useRef(false);

  const hex = hsvToHex(hue, sat, val);

  function updateSquareFromEvent(clientX: number, clientY: number) {
    const el = squareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const newSat = x * 100;
    const newVal = (1 - y) * 100;
    setSat(newSat);
    setVal(newVal);
    setHexText(hsvToHex(hue, newSat, newVal));
  }

  function updateHueFromEvent(clientX: number) {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const newHue = x * 360;
    setHue(newHue);
    setHexText(hsvToHex(newHue, sat, val));
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (draggingSquare.current) updateSquareFromEvent(e.clientX, e.clientY);
      if (draggingHue.current) updateHueFromEvent(e.clientX);
    }
    function onUp() {
      draggingSquare.current = false;
      draggingHue.current = false;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, sat, val]);

  function applyHexInput() {
    const parsed = hexToHsv(hexText);
    if (parsed) {
      setHue(parsed.h);
      setSat(parsed.s);
      setVal(parsed.v);
      setHexText(hsvToHex(parsed.h, parsed.s, parsed.v));
    } else {
      setHexText(hex);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-80">
      <div className="bg-surface-weak w-[600px] rounded-[24px] p-[24px] flex flex-col gap-[24px]">
        <div className="flex flex-row items-center justify-between">
          <p className="text-title-h6 text-strong">Create custom color</p>
          <div
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-full bg-surface-light flex items-center justify-center text-strong cursor-pointer shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex flex-row gap-[16px]">
          <div className="w-[168px] h-[260px] rounded-[16px] overflow-hidden relative shrink-0" style={{ background: hex }}>
            <div className="absolute top-[12px] left-[12px] px-[8px] py-[4px] rounded-[6px] bg-black-60 text-label-xs text-white">
              Preview
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-[16px]">
            <div
              ref={squareRef}
              onMouseDown={(e) => {
                draggingSquare.current = true;
                updateSquareFromEvent(e.clientX, e.clientY);
              }}
              className="relative w-full h-[190px] rounded-[12px] cursor-crosshair"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
              }}
            >
              <div
                className="absolute w-[16px] h-[16px] rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] pointer-events-none"
                style={{ left: `${sat}%`, top: `${100 - val}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>

            <div
              ref={hueRef}
              onMouseDown={(e) => {
                draggingHue.current = true;
                updateHueFromEvent(e.clientX);
              }}
              className="relative w-full h-[10px] rounded-[999px] cursor-pointer"
              style={{
                background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
              }}
            >
              <div
                className="absolute w-[16px] h-[16px] rounded-full border-2 border-white top-1/2 pointer-events-none"
                style={{ left: `${(hue / 360) * 100}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <p className="text-label-sm text-sub">Hex</p>
              <div className="h-[40px] rounded-[10px] bg-surface-soft flex flex-row items-center px-[12px] gap-[8px]">
                <span className="text-label-sm text-sub">#</span>
                <input
                  value={hexText.replace(/^#/, "")}
                  onChange={(e) => setHexText(e.target.value)}
                  onBlur={applyHexInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyHexInput();
                  }}
                  className="flex-1 bg-transparent outline-none text-label-sm text-strong uppercase"
                />
                <div onClick={handleCopy} className="cursor-pointer text-sub hover:text-strong shrink-0">
                  {copied ? (
                    <span className="text-label-xs">Copied</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M3.5 10.5H3A1.5 1.5 0 0 1 1.5 9V3A1.5 1.5 0 0 1 3 1.5H9A1.5 1.5 0 0 1 10.5 3v.5" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center justify-end gap-[12px]">
          <button onClick={onClose} className="px-[16px] py-[10px] rounded-[10px] bg-surface-light text-label-sm text-strong cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => onAdd(hex)}
            className="px-[16px] py-[10px] rounded-[10px] bg-white text-label-sm text-darker cursor-pointer"
          >
            Add color
          </button>
        </div>
      </div>
    </div>
  );
}
