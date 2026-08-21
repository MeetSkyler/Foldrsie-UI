"use client";
import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-90">
      <div className="bg-surface-weak w-[780px] rounded-[24px] p-[24px] flex flex-col gap-[24px]">
        <div className="flex flex-row items-center justify-between">
          <p className="text-label-lg text-strong">Create custom color</p>
          <div
            onClick={onClose}
            className="w-[24px] h-[24px]  flex items-center justify-center cursor-pointer shrink-0"
          >
            <svg  width="10" height="10" viewBox="0 0 10 10" fill="none">
             <path d="M8.59961 0.600098L0.599609 8.6001M0.599609 0.600098L8.59961 8.6001" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="flex flex-row gap-[16px] ">
          <div className="w-[230px] h-[350px] rounded-[16px] overflow-hidden flex justify-start relative shrink-0 p-[12px]" style={{ background: hex }}>
           
             <p className="py-[6px] px-[10px] rounded-[8px] text-label-sm text-strong  bg-black-60 absolute"> Preview </p>
           
          </div>

          <div className="flex-1 flex flex-col  gap-[24px]">
          <div className="flex flex-col flex-1  gap-[16px]">
              <div
              ref={squareRef}
              onMouseDown={(e) => {
                draggingSquare.current = true;
                updateSquareFromEvent(e.clientX, e.clientY);
              }}
              className="relative w-full h-[230px] rounded-[16px] cursor-crosshair"
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
              onMouseDown={(e) => {
                draggingHue.current = true;
                updateHueFromEvent(e.clientX);
              }}
              className="relative w-full h-[16px] rounded-[999px] cursor-pointer"
              style={{
                background: " linear-gradient(90deg, #FF3E3E 0.41%, #FFA83E 9.82%, #C5FF3F 22.94%, #33FF5C 35.34%, #36FFE4 47.04%, #3D87FF 61.58%, #A537FF 74.27%, #FF2A9F 87.68%, #FF2024 100%)",
              }}
            >
              <div
                className="absolute w-[24px] h-[24px] rounded-full bg-white top-1/2 pointer-events-none"
                style={{ left: `${(hue / 360) * 100}%`, transform: "translate(-50%, -50%)",
                  boxShadow:"0 0 0 1px rgba(0, 0, 0, 0.20)"
                 }}
              />
            </div>

          </div>

            <div className="flex flex-col flex-1  gap-[8px]">
              <p className="text-label-sm text-soft">Hex</p>

              <div className="h-[40px] rounded-[8px] bg-surface-light flex flex-row items-center px-[12px]">
                <span className="text-label-sm text-sub px-[4px]">#</span>
                <input
                  value={hexText.replace(/^#/, "")}
                  onChange={(e) => setHexText(e.target.value)}
                  onBlur={applyHexInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyHexInput();
                  }}
                  className="flex-1 outline-none text-label-sm text-strong uppercase px-[4px]"
                />
                <div onClick={handleCopy} className="cursor-pointer  relative text-sub hover:text-strong shrink-0">
                  {copied ? (
                     <>
                      <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
                   <path d="M3.34333 13.9475C3.08779 13.8018 2.87523 13.5912 2.72715 13.3371C2.57906 13.0829 2.50071 12.7942 2.5 12.5V4.16667C2.5 3.25 3.25 2.5 4.16667 2.5H12.5C13.125 2.5 13.465 2.82083 13.75 3.33333M5.83333 8.05583C5.83333 7.46639 6.06749 6.90109 6.48429 6.48429C6.90109 6.06749 7.46639 5.83333 8.05583 5.83333H15.2775C15.5694 5.83333 15.8584 5.89082 16.128 6.00251C16.3977 6.1142 16.6427 6.27791 16.849 6.48429C17.0554 6.69067 17.2191 6.93567 17.3308 7.20532C17.4425 7.47497 17.5 7.76397 17.5 8.05583V15.2775C17.5 15.5694 17.4425 15.8584 17.3308 16.128C17.2191 16.3977 17.0554 16.6427 16.849 16.849C16.6427 17.0554 16.3977 17.2191 16.128 17.3308C15.8584 17.4425 15.5694 17.5 15.2775 17.5H8.05583C7.76397 17.5 7.47497 17.4425 7.20532 17.3308C6.93567 17.2191 6.69067 17.0554 6.48429 16.849C6.27791 16.6427 6.1142 16.3977 6.00251 16.128C5.89082 15.8584 5.83333 15.5694 5.83333 15.2775V8.05583Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                    <motion.p
                      initial={{ opacity: 0, y:-43 }}
                      animate={{ opacity: 1, y:-50 }}
                       transition={{
                       duration: 0.3,
                       ease: [0.22, 1, 0.36, 1],
                     }}
                     className="text-label-xs absolute -ml-[13px] hover:text-strong text-strong">Copied</motion.p>
                     </>
                    
                  ) : (
            
                            
                   <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
                   <path d="M3.34333 13.9475C3.08779 13.8018 2.87523 13.5912 2.72715 13.3371C2.57906 13.0829 2.50071 12.7942 2.5 12.5V4.16667C2.5 3.25 3.25 2.5 4.16667 2.5H12.5C13.125 2.5 13.465 2.82083 13.75 3.33333M5.83333 8.05583C5.83333 7.46639 6.06749 6.90109 6.48429 6.48429C6.90109 6.06749 7.46639 5.83333 8.05583 5.83333H15.2775C15.5694 5.83333 15.8584 5.89082 16.128 6.00251C16.3977 6.1142 16.6427 6.27791 16.849 6.48429C17.0554 6.69067 17.2191 6.93567 17.3308 7.20532C17.4425 7.47497 17.5 7.76397 17.5 8.05583V15.2775C17.5 15.5694 17.4425 15.8584 17.3308 16.128C17.2191 16.3977 17.0554 16.6427 16.849 16.849C16.6427 17.0554 16.3977 17.2191 16.128 17.3308C15.8584 17.4425 15.5694 17.5 15.2775 17.5H8.05583C7.76397 17.5 7.47497 17.4425 7.20532 17.3308C6.93567 17.2191 6.69067 17.0554 6.48429 16.849C6.27791 16.6427 6.1142 16.3977 6.00251 16.128C5.89082 15.8584 5.83333 15.5694 5.83333 15.2775V8.05583Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                
                  )}
                </div>
              </div>

            </div>


          </div>
        </div>

        <div className="flex flex-row items-center justify-end gap-[12px]">
          <button onClick={onClose} className="s-btn-noicon-36 text-label-sm cursor-pointer">
           <p className="px-[4px]"> Cancel </p>
          </button>
          <button
            onClick={() => onAdd(hex)}
            className="p-btn-noicon-36 cursor-pointer text-label-sm"
          >
            Add color
          </button>
        </div>
      </div>
    </div>
  );
}
