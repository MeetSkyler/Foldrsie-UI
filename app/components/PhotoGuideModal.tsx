"use client";
// ......PhotoGuideModal........//
// Shared "Photo guide" overlay opened from any option's first upload card
// (Face/Top/Bottom/Footwear — see app/config/photoGuideConfig.ts for the
// per-option title/subtitle/example data). One UI, swappable content: every
// option gets the exact same do's/avoid layout, just with its own images
// and captions passed in via `data`.
import Image from "next/image";
import type { PhotoGuideData } from "@/app/config/photoGuideConfig";

function ExampleGrid({ items }: { items: PhotoGuideData["doItems"] }) {
  return (
    <div className="w-full grid grid-cols-4 gap-[20px]">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-[11px]">
          <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-surface-soft">
            <Image src={item.image} alt={item.caption} fill unoptimized className="object-cover" />
          </div>
          <p className="text-paragraph-sm text-white text-center">{item.caption}</p>
        </div>
      ))}
    </div>
  );
}

export default function PhotoGuideModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: PhotoGuideData;
}) {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[60] flex items-center justify-center bg-black-90 px-[24px]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[780px] overflow-y-auto bg-surface-weak no-scrollbar rounded-[24px] p-[24px] border border-line-sub flex flex-col gap-[32px]"
      >
        <div className="flex flex-row items-start justify-between gap-[24px]">
          <div className="flex flex-col gap-[8px]">
            <p className="text-label-lg text-strong">{data.title}</p>
            <p className="text-paragraph-sm text-sub">{data.subtitle}</p>
          </div>
          <div onClick={onClose} className="w-[24px] h-[24px] flex items-center justify-center cursor-pointer shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

       <div className="flex flex-col gap-[40px] w-full ">
         <div className="flex flex-col gap-[24px]">
          <div className="flex flex-row items-center gap-[12px]">
            <div className="w-[24px] h-[24px] rounded-full bg-semantic-green-600 flex items-center justify-center shrink-0">
            <svg  width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2.42993 6.48027L5.12993 9.18027L10.5299 3.78027" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </div>
            <p className="text-label-lg text-strong">Use photos like these</p>
          </div>
          <ExampleGrid items={data.doItems} />
        </div>

        <div className="flex flex-col gap-[24px] ">
          <div className="flex flex-row items-center gap-[12px]">
            <div className="w-[24px] h-[24px] rounded-full bg-semantic-red-600 flex items-center justify-center shrink-0">
             <svg  width="15" height="15" viewBox="0 0 15 15" fill="none">
             <path d="M10.8006 3.60059L3.60059 10.8006M3.60059 3.60059L10.8006 10.8006" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </div>
            <p className="text-label-lg text-strong">Avoid photos like these</p>
          </div>
          <ExampleGrid items={data.avoidItems} />
        </div>
       </div>
      </div>
    </div>
  );
}
