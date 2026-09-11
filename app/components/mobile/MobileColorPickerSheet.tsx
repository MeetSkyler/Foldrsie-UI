"use client";
// ......MobileColorPickerSheet........//
// Mobile equivalent of desktop's ColorPickerModal (create-custom-color) —
// same hue/saturation-value picker and hex logic, but presented as an
// iOS-style bottom sheet (drag handle, flick-to-dismiss) matching
// MobileGarmentUploadSheet, instead of desktop's centered dialog. The
// saturation/value square and hue slider use pointer events (not mouse
// events) so they respond to a real finger; the outer sheet's own drag is
// only armed from the handle (`dragListener={false}` + `dragControls`) so
// dragging inside the picker never gets hijacked into a sheet-dismiss.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";

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

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
  } catch {
    // no-op — nothing more we can do without Clipboard API support
  }
  document.body.removeChild(textarea);
}

const DRAG_DISMISS_DISTANCE = 120;
const DRAG_DISMISS_VELOCITY = 500;
// A tighter, less floaty spring than a default one — quick to settle with
// just a hint of overshoot, closer to iOS's own sheet-presentation feel
// than a long, bouncy spring would be.
const SHEET_SPRING = { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.9 };

export default function MobileColorPickerSheet({
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
  // Plays the sheet's exit animation before actually unmounting — the
  // parent's own onClose (which removes this component from the tree) only
  // fires once AnimatePresence reports that animation finished.
  const [isClosing, setIsClosing] = useState(false);

  function requestClose() {
    setIsClosing(true);
  }

  const squareRef = useRef<HTMLDivElement | null>(null);
  const hueRef = useRef<HTMLDivElement | null>(null);
  const draggingSquare = useRef(false);
  const draggingHue = useRef(false);
  const dragControls = useDragControls();

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
    function onMove(e: PointerEvent) {
      if (draggingSquare.current) updateSquareFromEvent(e.clientX, e.clientY);
      if (draggingHue.current) updateHueFromEvent(e.clientX);
    }
    function onUp() {
      draggingSquare.current = false;
      draggingHue.current = false;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
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

  // iOS Safari auto-zooms the whole page in on focus for any input whose
  // font-size is under 16px (text-label-sm is 14px) — rather than bumping
  // this one input's font to 16px (which looked off), lock the page's own
  // zoom for as long as it's focused, which heads off that auto-zoom at the
  // source, then restore whatever the page's own viewport meta said before.
  function handleHexFocus() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;
    viewport.setAttribute("data-pre-focus-content", viewport.getAttribute("content") ?? "");
    viewport.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no");
  }

  function handleHexBlur() {
    applyHexInput();
    const viewport = document.querySelector('meta[name="viewport"]');
    const original = viewport?.getAttribute("data-pre-focus-content");
    if (viewport && original) {
      viewport.setAttribute("content", original);
      viewport.removeAttribute("data-pre-focus-content");
    }
  }

  function handleCopy() {
    // navigator.clipboard is only defined in a secure context (https, or
    // localhost) — on a phone opening this over a plain-http LAN IP for
    // dev testing it's `undefined`, so calling `.writeText` throws
    // synchronously and aborts the handler before `setCopied` ever runs.
    // The execCommand fallback works in that case too.
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(hex).catch(() => fallbackCopy(hex));
    } else {
      fallbackCopy(hex);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DRAG_DISMISS_DISTANCE || info.velocity.y > DRAG_DISMISS_VELOCITY) {
      requestClose();
    }
  }

  return (
    <AnimatePresence onExitComplete={onClose}>
      {!isClosing && (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden">
      <motion.div
        onClick={requestClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute inset-0 bg-black-90"
      />

      <motion.div
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={SHEET_SPRING}
        className="relative w-full h-[calc(100dvh-80px)] bg-surface-weak rounded-t-[24px] flex flex-col"
      >
        {/* Fixed header — only this area can start a sheet-drag, so the
            color square/hue slider below stay free for their own drags. */}
        <div className="shrink-0 flex flex-col gap-[5px] w-full pt-[6px] px-[16px]">
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="w-full flex items-center justify-center py-[4px] cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="w-[36px] h-[5px] rounded-full bg-surface-light" />
          </div>
          <div className="flex flex-row items-start justify-between">
            <p className="text-label-md text-strong pt-[11px]">Create custom color</p>
          
            <div onClick={requestClose} className="w-[32px] h-[32px] rounded-full bg-surface-soft flex items-center justify-center cursor-pointer shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Only this middle section scrolls — Cancel/Add stay reachable no
            matter how short the screen is. */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pt-[27px]">
          <div className="flex flex-col gap-[12px] pb-[24px] ">
             {/* ......Preview box ....... */}
            <div className="relative w-full h-[120px] rounded-[16px] overflow-hidden flex items-start p-[12px]" style={{ background: hex }}>
              <p className="py-[6px] px-[10px] rounded-[8px] text-label-xs text-strong bg-black-60">Preview</p>
            </div>

            {/* .......color selection box ......... */}
            <div className="flex flex-col gap-[16px] ">
              <div
                ref={squareRef}
                onPointerDown={(e) => {
                  draggingSquare.current = true;
                  updateSquareFromEvent(e.clientX, e.clientY);
                }}
                className="relative w-full h-[230px] rounded-[16px] touch-none"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
                }}
              >
                <div
                  className="absolute w-[24px] h-[24px] rounded-full border outline-none border-white pointer-events-none"
                  style={{ left: `${sat}%`, top: `${100 - val}%`, transform: "translate(-50%, -50%)" }}
                />
              </div>

              <div
                ref={hueRef}
                onPointerDown={(e) => {
                  draggingHue.current = true;
                  updateHueFromEvent(e.clientX);
                }}
                className="relative w-full h-[16px] rounded-[999px] touch-none"
                style={{
                  background:
                    "linear-gradient(90deg, #FF3E3E 0.41%, #FFA83E 9.82%, #C5FF3F 22.94%, #33FF5C 35.34%, #36FFE4 47.04%, #3D87FF 61.58%, #A537FF 74.27%, #FF2A9F 87.68%, #FF2024 100%)",
                }}
              >
                <div
                  className="absolute w-[24px] h-[24px] rounded-full bg-white top-1/2 pointer-events-none"
                  style={{
                    left: `${(hue / 360) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.20)",
                  }}
                />
              </div>
            </div>
           
           {/* ........Hex box Copy Code ....... */}
            <div className="flex flex-col gap-[8px] mt-[12px] ">
              <p className="text-label-sm text-sub">Hex</p>
              <div className="h-[44px] rounded-[8px] bg-surface-light flex flex-row items-center py-[8px] px-[12px]">
                <span className="text-label-sm text-sub px-[4px]">#</span>
                <input
                  value={hexText.replace(/^#/, "")}
                  onChange={(e) => setHexText(e.target.value)}
                  onFocus={handleHexFocus}
                  onBlur={handleHexBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyHexInput();
                  }}
                  className="flex-1 outline-none text-label-sm text-strong uppercase px-[4px] bg-transparent"
                />
                
                <div onClick={handleCopy} className="cursor-pointer relative text-sub shrink-0">
                  {copied && (
                  <motion.p
                     initial={{ opacity: 0, y:-23 }}
                     animate={{ opacity: 1, y:-32 }}
                     transition={{
                     duration: 0.3,
                     ease: [0.22, 1, 0.36, 1],
                    }}
                    className="text-label-xs absolute -ml-[13px]  text-strong">Copied</motion.p>
                  )}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3.34333 13.9475C3.08779 13.8018 2.87523 13.5912 2.72715 13.3371C2.57906 13.0829 2.50071 12.7942 2.5 12.5V4.16667C2.5 3.25 3.25 2.5 4.16667 2.5H12.5C13.125 2.5 13.465 2.82083 13.75 3.33333M5.83333 8.05583C5.83333 7.46639 6.06749 6.90109 6.48429 6.48429C6.90109 6.06749 7.46639 5.83333 8.05583 5.83333H15.2775C15.5694 5.83333 15.8584 5.89082 16.128 6.00251C16.3977 6.1142 16.6427 6.27791 16.849 6.48429C17.0554 6.69067 17.2191 6.93567 17.3308 7.20532C17.4425 7.47497 17.5 7.76397 17.5 8.05583V15.2775C17.5 15.5694 17.4425 15.8584 17.3308 16.128C17.2191 16.3977 17.0554 16.6427 16.849 16.849C16.6427 17.0554 16.3977 17.2191 16.128 17.3308C15.8584 17.4425 15.5694 17.5 15.2775 17.5H8.05583C7.76397 17.5 7.47497 17.4425 7.20532 17.3308C6.93567 17.2191 6.69067 17.0554 6.48429 16.849C6.27791 16.6427 6.1142 16.3977 6.00251 16.128C5.89082 15.8584 5.83333 15.5694 5.83333 15.2775V8.05583Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            
          </div>
        </div>

        {/* Fixed footer — Cancel/Add stay reachable no matter how tall the
            content above gets. */}
        <div
          className="shrink-0 flex flex-row items-center gap-[12px] pt-[12px] px-[16px]"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <button onClick={requestClose} className="s-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => onAdd(hex)}
            className="p-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer"
          >
            Add color
          </button>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
}
