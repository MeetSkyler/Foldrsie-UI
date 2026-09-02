"use client";
import { motion } from "motion/react";
import { useState } from "react";


export type SourceFilter = "all" | "uploads" | "library";

const OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "uploads", label: "My uploads" },
  { value: "library", label: "Library" },
];

export default function SourceFilterDropdown({
  value,
  onChange,
}: {
  value: SourceFilter;
  onChange: (v: SourceFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div className="relative">
      <div
        onClick={() => setOpen((o) => !o)}
        className="h-full p-[6px] select-none  flex flex-row gap-[4px] border items-center justify-center rounded-[8px] cursor-pointer"
        style={{
          border: "1px solid var(--color-white-8, rgba(235, 237, 240, 0.08))",
          background: "var(--color-surface-light, #2A2B2E)",
        }}
      >
        <p className="px-[4px] select-none flex items-center justify-center text-label-sm text-strong whitespace-nowrap">{current.label}</p>
        <div className="w-[18px] h-[18px] select-none flex items-center justify-center shrink-0">
          <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
            <path d="M0.75 0.75L5.25 5.25L9.75 0.75" stroke="#8C8E91" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {open && (
        <>
          <motion.div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <motion.div 
           initial={{opacity:0,y: -6, scale: 0.98}}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -4, scale: 0.98 }}
           transition={{
            duration: 0.15,
            ease: "easeOut",
        }}
           className="absolute select-none right-0 top-[calc(100%+8px)] p-[4px] gap-[4px] flex flex-col z-20 w-[160px] rounded-[12px] bg-surface-mid  overflow-hidden">
            {OPTIONS.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`h-[32px] select-none w-full text-label-sm cursor-pointer flex flex-row items-center transition-colors duration-100 ease-out  text-strong hover:bg-surface-alpha-light-white rounded-[8px] justify-between p-[6px]
                   ${opt.value === value ?
                    " bg-surface-alpha-light-white hover:bg-surface-alpha-light-white " 
                    : 
                    " "
                }`}
                 >
                <span className="px-[4px]">{opt.label}</span>
                {opt.value===value&&(
                  <svg  width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-sub">
                    <path d="M3 8.75L6.75 12.5L14.25 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
