"use client";
// ......MobileGalleryHome........//
// Mobile counterpart of the desktop gallery grid (app/gallery/page.tsx) —
// same data source and actions (view fullscreen, download), laid out as a
// simple 2-column tap grid instead of desktop's zoom-slider masonry (no
// hover on touch, so there's nothing for a zoom control to reveal).
import { useState } from "react";
import Image from "next/image";
import { useGenerations } from "@/app/context/generations-context";

function downloadImage(src: string) {
  const a = document.createElement("a");
  a.href = src;
  a.download = "foldrise-result";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function MobileGalleryHome() {
  const { generations } = useGenerations();
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  const items = [...generations].reverse();
  const viewing = items.find((g) => g.id === fullscreenId);

  return (
    <div className="flex md:hidden flex-col w-full h-full overflow-y-auto no-scrollbar bg-surface-dark px-[16px] pt-[24px] pb-[24px] gap-[20px]">
      <p className="text-label-lg text-strong">Gallery</p>

      {items.length === 0 ? (
        <p className="text-paragraph-sm text-sub">No generations yet, head back to Generate to create your first shot.</p>
      ) : (
        <div className="grid grid-cols-2 gap-[8px]">
          {items.map((g) => (
            <button
              key={g.id}
              onClick={() => setFullscreenId(g.id)}
              style={{ aspectRatio: g.ratio }}
              className="relative rounded-[16px] overflow-hidden bg-surface-soft cursor-pointer"
            >
              <Image src={g.image} alt="Generated result" fill unoptimized className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface-dark px-[16px]">
          <div className="w-full shrink-0 flex flex-row items-center justify-between pt-[12px] pb-[32px]">
            <p className="text-label-lg text-strong">Gallery</p>
            <div
              onClick={() => setFullscreenId(null)}
              className="w-[32px] h-[32px] rounded-full bg-surface-soft flex items-center justify-center cursor-pointer shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image src={viewing.image} alt="Generated result" fill unoptimized className="object-contain" />
            </div>
          </div>

          <div className="shrink-0 pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))]">
            <button
              onClick={() => downloadImage(viewing.image)}
              className="p-btn-noicon-48 w-full text-label-sm flex items-center justify-center cursor-pointer"
            >
              <p className="px-[4px]">Download</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
