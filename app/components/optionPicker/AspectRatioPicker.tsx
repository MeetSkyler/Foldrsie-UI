"use client";
import { useState } from "react";
import { useOptionSelection } from "@/app/context/option-selection-context";
import Image from 'next/image';
import ratio1 from '@/public/ratio1.svg'
import { label } from "motion/react-client";

export type AspectRatioItem = {
  id: string;
  name: string;
  ratioLabel: string; // e.g. "2:3"
  ratio: number; // width / height
};

export type AspectRatioConfig = {
  key: string;
  label: string;
  description: string;
  items: AspectRatioItem[];
};


// Same column-stop approach as OptionPicker: every zoom stop the slider can
// land on is guaranteed to look different from its neighbors.
const COLUMN_STOPS = [6, 5, 4, 3, 2];
const ZOOM_STEP = 100 / (COLUMN_STOPS.length - 1);

const BOX = 96; // px, bounding box the ratio preview is fit inside

function RatioPreview({ ratio, label, size = BOX }: { ratio: number; label: string; size?: number }) {
  const w = ratio >= 1 ? size : size * ratio;
  const h = ratio >= 1 ? size / ratio : size;
  return (
    <div className="rounded-[8px] bg-surface-soft flex items-center justify-center text-label-sm text-sub" style={{ width: w, height: h }}>
      {label}
    </div>
  );
}

const AspectRatioPicker = ({ config }: { config: AspectRatioConfig }) => {
  const { selections, setSelection } = useOptionSelection();
  const [zoom, setZoom] = useState(50);
  const [selectedId, setSelectedId] = useState<string | null>(() => selections[config.key]?.id ?? null);

  const columns = COLUMN_STOPS[Math.round(zoom / ZOOM_STEP)];

  function handleSelect(item: AspectRatioItem) {
    setSelectedId(item.id);
    setSelection(config.key, { id: item.id, ratio: item.ratio, ratioLabel: item.ratioLabel });
  }

  return (
    <div className="w-full h-full pb-[24px] px-[20px] bg-neutral-900 overflow-y-auto no-scrollbar">
      <div className="w-full mt-[24px] rounded-[20px] bg-surface-weak border border-line-sub flex flex-col">
        <p className="text-label-lg text-strong capitalize px-[20px] pt-[24px] pb-[16px]">Choose a {config.label}</p>

        {/* This row sticks to the top of the scroll container once the title
            scrolls past it, so only the card grid keeps scrolling under it. */}
        <div className="sticky -top-[2px] z-10 bg-surface-weak px-[20px] py-[12px]">
          <div className="w-full h-[32px] flex flex-row items-center justify-between">
            <p className="text-label-sm text-white capitalize">All {config.description}</p>
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

          <div className="grid gap-[16px] px-[20px] pb-[24px] pt-[16px]" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {config.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="group aspect-[5/6] relative rounded-[16px] border border-line-sub bg-surface-weak hover:bg-surface-alpha-light-soft flex flex-col items-center justify-center  cursor-pointer"
              >
              
                {selectedId === item.id && (
                  <div className="absolute top-[12px] flex items-center justify-center gap-[4px] flex-row left-[12px] pl-[4px] pr-[8px] py-[4px] rounded-[6px] bg-surface-light">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-strong">
                      <path d="M3.33203 7.99935L6.66536 11.3327L13.332 4.66602" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-label-xs text-[#FFFFFF]">Selected</p>
                  </div>
                )}
                <div>
                 
                  
                  <Image src={ratio1} alt="RatioImages" width={100} height={100} />
                    <p className="text-label-sm text-strong">{item.name}</p>
                </div>

               

               
              </button>
            ))}
          </div>
      </div>
    </div>
  );
};

export default AspectRatioPicker;
