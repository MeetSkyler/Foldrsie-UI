"use client";
import { useRef, useState } from "react";
import { useOptionSelection } from "@/app/context/option-selection-context";
import { useResponsiveColumns } from "./useResponsiveColumns";
import { useIsLargeScreen } from "./useIsLargeScreen";
import { useZoom } from "@/app/context/zoom-context";
import Image from 'next/image';
import ratio1 from '@/public/ratio1.svg'
import ratio2 from '@/public/ratio2.svg'
import ratio3 from '@/public/ratio3.svg'
import ratio4 from '@/public/ratio4.svg'
import ratio5 from '@/public/ratio5.svg'
import ratio6 from '@/public/ratio6.svg'

// Indexed by card position — first card gets ratio1, second ratio2, etc.
const RATIO_IMAGES = [ratio1, ratio2, ratio3, ratio4, ratio5, ratio6];

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
// land on is guaranteed to look different from its neighbors. Screens above
// 1441px get the fuller 5-stop range (matches the Gallery page); at/below
// 1441px, cards enforcing a 184px min-width don't have room for 5-6 distinct
// column counts without stops collapsing into duplicates (see
// useResponsiveColumns), so that range is reduced to 3 stops instead. Each
// array's ZOOM_STEP must divide 100 with zero floating-point remainder
// (both do: 100/4=25, 100/2=50), or the native slider's own step math
// (floor((max-min)/step)) rounds down a full step short and the last stop
// becomes permanently unreachable by drag/keyboard.
const COLUMN_STOPS_LARGE = [6, 5, 4, 3, 2];
const COLUMN_STOPS_SMALL = [4, 3, 2];

// ---- Ratio-preview sizing ----
// Designer spec: the preview image itself is a fixed size at every zoom
// level — only the card (via column count) changes with zoom, never the
// image. The gap between image and name label still scales with zoom.
const IMG_WIDTH = 150; // px — fixed, does not change with zoom
const IMG_HEIGHT = 180; // px — fixed, does not change with zoom
const MIN_IMG_LABEL_GAP = 26; // px — gap between image and name label at zoom 0
const MAX_IMG_LABEL_GAP = 37; // px — gap between image and name label at zoom 100

// The image+label pair is wrapped in one flex column so it always moves and
// centers together in the card, at every size in between.
function aspectCardMetrics(zoom: number) {
  const t = zoom / 100; // 0 -> 1 across the full slider
  return {
    imgWidth: IMG_WIDTH,
    imgHeight: IMG_HEIGHT,
    gap: MIN_IMG_LABEL_GAP + t * (MAX_IMG_LABEL_GAP - MIN_IMG_LABEL_GAP),
  };
}

const AspectRatioPicker = ({ config }: { config: AspectRatioConfig }) => {
  const { selections, setSelection } = useOptionSelection();
  const isLargeScreen = useIsLargeScreen();
  const COLUMN_STOPS = isLargeScreen ? COLUMN_STOPS_LARGE : COLUMN_STOPS_SMALL;
  const ZOOM_STEP = 100 / (COLUMN_STOPS.length - 1);
  // Shared across every option-picker page so the zoom the user picks on
  // one page (e.g. Pose) carries over instead of resetting on the next.
  const { zoom, setZoom } = useZoom();
  const [selectedId, setSelectedId] = useState<string | null>(() => selections[config.key]?.id ?? null);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const desiredColumns = COLUMN_STOPS[Math.round(zoom / ZOOM_STEP)];
  const columns = useResponsiveColumns(gridRef, desiredColumns);
  const metrics = aspectCardMetrics(zoom);

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
              <p className="w-[27px] h-full flex items-center justify-end text-sub text-label-sm ">{Math.round(zoom)}</p>
            </div>
          </div>
        </div>

          <div ref={gridRef} className="grid gap-[16px] px-[20px] pb-[24px] pt-[16px]" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {config.items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="group aspect-[5/6] min-w-[184px] relative rounded-[16px] min-[1441px]:rounded-[24px] border border-line-sub bg-surface-weak hover:bg-surface-alpha-light-soft flex flex-col items-center justify-center  cursor-pointer"
              >

                {selectedId === item.id && (
                  <div className="absolute top-[12px] flex items-center justify-center gap-[4px] flex-row left-[12px] pl-[4px] pr-[8px] py-[4px] rounded-[6px] bg-surface-light">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-strong">
                      <path d="M3.33203 7.99935L6.66536 11.3327L13.332 4.66602" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-label-xs text-[#FFFFFF]">Selected</p>
                  </div>
                )}
                {/* Image + name label wrapped together so the pair always
                    centers as one unit in the card, at every zoom stop. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: metrics.gap }}>
                  <div className="relative shrink-0" style={{ width: metrics.imgWidth, height: metrics.imgHeight }}>
                    <Image
                      src={RATIO_IMAGES[index % RATIO_IMAGES.length]}
                      alt={`${item.name} ${item.ratioLabel}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-label-sm text-strong text-center">{item.name}</p>
                </div>
              </button>
            ))}
          </div>
      </div>
    </div>
  );
};

export default AspectRatioPicker;
