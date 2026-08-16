"use client";
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
        className="h-full p-[6px] flex flex-row gap-[4px] border items-center justify-center rounded-[8px] cursor-pointer"
        style={{
          border: "1px solid var(--color-white-8, rgba(235, 237, 240, 0.08))",
          background: "var(--color-surface-light, #2A2B2E)",
        }}
      >
        <p className="px-[4px] flex items-center justify-center text-label-sm text-strong whitespace-nowrap">{current.label}</p>
        <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
          <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
            <path d="M0.75 0.75L5.25 5.25L9.75 0.75" stroke="#8C8E91" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[160px] rounded-[10px] bg-surface-light border border-line-sub overflow-hidden">
            {OPTIONS.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`px-[12px] py-[10px] text-label-sm cursor-pointer hover:bg-surface-mid ${
                  opt.value === value ? "text-strong bg-surface-mid" : "text-sub"
                }`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
