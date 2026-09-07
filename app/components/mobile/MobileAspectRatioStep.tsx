"use client";
// ......MobileAspectRatioStep........//
// Mobile body for the Aspect ratio step — same ratio-preview images and
// selection context as desktop's AspectRatioPicker, laid out as a fixed
// 2-column mobile grid instead of desktop's zoomable variable-column grid.
import Image from "next/image";
import { useOptionSelection } from "@/app/context/option-selection-context";
import type { AspectRatioConfig, AspectRatioItem } from "@/app/components/optionPicker/AspectRatioPicker";
import ratio1 from "@/public/ratio1.svg";
import ratio2 from "@/public/ratio2.svg";
import ratio3 from "@/public/ratio3.svg";
import ratio4 from "@/public/ratio4.svg";
import ratio5 from "@/public/ratio5.svg";
import ratio6 from "@/public/ratio6.svg";

const RATIO_IMAGES = [ratio1, ratio2, ratio3, ratio4, ratio5, ratio6];

export default function MobileAspectRatioStep({ config }: { config: AspectRatioConfig }) {
  const { selections, setSelection } = useOptionSelection();
  // Derived from the shared context every render — see the same note in
  // MobileOptionStep for why this isn't copied into local state.
  const selectedId = selections[config.key]?.id ?? null;

  function handleSelect(item: AspectRatioItem) {
    setSelection(config.key, { id: item.id, ratio: item.ratio, ratioLabel: item.ratioLabel });
  }

  return (
    <div className="flex flex-col gap-[16px] px-[20px] pb-[24px] pt-[32px]">
      <div className="grid grid-cols-2 gap-[12px]">
        {config.items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className="group aspect-[5/6] relative rounded-[16px] border border-line-sub bg-surface-weak active:bg-surface-alpha-light-soft flex flex-col items-center justify-center gap-[12px] cursor-pointer"
          >
            {selectedId === item.id && (
              <div className="absolute z-10 top-[12px] left-[12px] flex items-center justify-center gap-[4px] flex-row pl-[4px] pr-[8px] py-[4px] rounded-[6px] bg-surface-light">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.33203 7.99935L6.66536 11.3327L13.332 4.66602" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-label-xs text-[#FFFFFF]">Selected</p>
              </div>
            )}
            <div className="relative shrink-0 w-[80px] h-[96px]">
              <Image src={RATIO_IMAGES[index % RATIO_IMAGES.length]} alt={`${item.name} ${item.ratioLabel}`} fill className="object-contain" />
            </div>
            <p className="text-label-sm text-strong text-center">{item.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
