"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useGenerations } from '@/app/context/generations-context';

// Same column-stop approach as the option-picker pages: every zoom stop the
// slider can land on is guaranteed to look different from its neighbors.
const COLUMN_STOPS = [6, 5, 4, 3, 2];
const ZOOM_STEP = 100 / (COLUMN_STOPS.length - 1);

function downloadImage(src: string) {
  const a = document.createElement('a');
  a.href = src;
  a.download = 'foldrise-result';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const page = () => {
  const { generations } = useGenerations();
  const [zoom, setZoom] = useState(50);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  const columns = COLUMN_STOPS[Math.round(zoom / ZOOM_STEP)];
  const items = [...generations].reverse();
  const viewing = items.find((g) => g.id === fullscreenId);

  return (
    <div className="w-full h-full pb-[24px] px-[20px] bg-neutral-900 overflow-y-auto no-scrollbar">
      <div className="w-full mt-[24px] rounded-[20px] bg-surface-weak border border-line-sub flex flex-col">
        <p className="text-label-lg text-strong px-[20px] pt-[24px] pb-[16px]">Gallery</p>

        {/* This row sticks to the top of the scroll container once the title
            scrolls past it, so only the card grid keeps scrolling under it. */}
        <div className="sticky -top-[2px] z-10 bg-surface-weak px-[20px] py-[12px]">
          <div className="w-full h-[32px] flex flex-row items-center justify-between">
            <p className="text-label-sm text-white">All results</p>
            <div className="h-full py-[6px] flex flex-row items-center justify-center gap-[12px]">
              <input
                type="range"
                min={0}
                max={100}
                step={ZOOM_STEP}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="zoom-slider w-[96px] h-[4px]"
                style={{
                  background: `linear-gradient(to right, #DAECF5 0%, #DAECF5 ${zoom}%, rgba(218, 236, 245, 0.15) ${zoom}%, rgba(218, 236, 245, 0.15) 100%)`,
                }}
              />
              <p className="w-[27px] h-full flex items-center justify-end text-sub text-label-sm ">{zoom}</p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="px-[20px] pb-[24px] text-paragraph-sm text-sub">No generations yet — head back to Generate to create your first shot.</p>
        ) : (
          <div className="grid gap-[16px] px-[20px] pb-[24px] pt-[16px]" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {items.map((g) => (
              <div key={g.id} className="group aspect-[5/6] rounded-[16px] overflow-hidden relative bg-surface-soft">
                <Image src={g.image} alt="Generated result" fill unoptimized className="object-cover" />

                <div className="absolute top-[8px] right-[8px] flex flex-row gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    onClick={() => downloadImage(g.image)}
                    className="w-[28px] h-[28px] rounded-[8px] bg-black-60 flex items-center justify-center cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5V9.5M7 9.5L4 6.5M7 9.5L10 6.5M2 11.5H12" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div
                    onClick={() => setFullscreenId(g.id)}
                    className="w-[28px] h-[28px] rounded-[8px] bg-black-60 flex items-center justify-center cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 2H2V6M10 2H14V6M14 10V14H10M2 10V14H6" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <div
          onClick={() => setFullscreenId(null)}
          className="fixed inset-0 z-50 bg-black-90 flex items-center justify-center"
        >
          <div onClick={(e) => e.stopPropagation()} className="relative" style={{ width: '80vw', height: '80vh' }}>
            <Image src={viewing.image} alt="Generated result" fill unoptimized className="object-contain" />
            <div
              onClick={() => setFullscreenId(null)}
              className="absolute -top-[48px] right-0 w-[36px] h-[36px] rounded-full bg-surface-light flex items-center justify-center text-strong cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
