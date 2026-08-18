"use client";
import { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useOptionSelection } from "@/app/context/option-selection-context";
import UploadGarmentModal, { GarmentUploadResult } from "./UploadGarmentModal";
import SourceFilterDropdown, { SourceFilter } from "./SourceFilterDropdown";

export type GarmentItem = {
  id: string;
  front?: StaticImageData | string;
  back?: StaticImageData | string;
  closeup?: StaticImageData | string;
};

// Sidebar icon can only show one image — prefer front, then back, then closeup.
function primaryImage(item: GarmentItem) {
  return item.front ?? item.back ?? item.closeup;
}

export type GarmentPickerConfig = {
  key: string;
  label: string; // singular, e.g. "top" — drives "Choose a {label}" / "All {label}s"
  description: string;
  categories?: string[];
  items: GarmentItem[];
};

// Same column-stop approach as OptionPicker: every zoom stop the slider can
// land on is guaranteed to look different from its neighbors.
const COLUMN_STOPS = [6, 5, 4, 3, 2];
const ZOOM_STEP = 100 / (COLUMN_STOPS.length - 1);

// Cards shrink as zoom drops toward 0 (more columns) — scale the icon,
// gap, label and footer note down to match, so both blocks physically fit
// above/below one another without colliding at the narrowest card sizes.
// Unaffected from zoom 50 upward, where the default sizes already fit.
function responsiveCardText(zoom: number) {
  const t = Math.min(zoom, 50) / 50; // 0 at zoom<=0, 1 at zoom>=50
  const iconBox = 18 + t * 14; // 18px -> 32px
  const labelFontSize = 10 + t * 4; // 10px -> 14px
  const noteFontSize = 7 + t * 5; // 7px -> 12px
  return {
    iconBox: { width: `${iconBox}px`, height: `${iconBox}px`, padding: `${2 + t * 4}px` } as React.CSSProperties,
    iconSvg: Math.round(11 + t * 9), // 11 -> 20
    gap: `${4 + t * 8}px`, // 4px -> 12px
    label: {
      fontSize: `${labelFontSize}px`,
      lineHeight: `${labelFontSize * 1.2}px`,
    } as React.CSSProperties,
    note: {
      fontSize: `${noteFontSize}px`,
      lineHeight: `${noteFontSize * 1.15}px`,
      bottom: `${10 + t * 24}px`, // 10px -> 34px
    } as React.CSSProperties,
  };
}

function Thumb({ image, alt }: { image: StaticImageData | string | undefined; alt: string }) {
  if (!image) {
    return <div className="w-[41px] h-[50px] rounded-[8px] bg-surface-white border-[1.5px] border-[#FFFFFF]" 
    style={{boxShadow:" 0 0 0 1.4px rgba(0, 0, 0, 0.08), 0 8px 8px -4px rgba(0, 0, 0, 0.07), 0 6px 6px -3px rgba(0, 0, 0, 0.07), 0 4px 4px -2px rgba(0, 0, 0, 0.04), 0 2px 2px -1px rgba(0, 0, 0, 0.04)"}}/>;
  }
  return (
    <div className="relative w-[41px] h-[50px] rounded-[8px] overflow-hidden border-[1.5px] border-[#FFFFFF] bg-surface-white "
    style={{boxShadow:" 0 0 0 1.4px rgba(0, 0, 0, 0.08), 0 8px 8px -4px rgba(0, 0, 0, 0.07), 0 6px 6px -3px rgba(0, 0, 0, 0.07), 0 4px 4px -2px rgba(0, 0, 0, 0.04), 0 2px 2px -1px rgba(0, 0, 0, 0.04)"}}>
      <Image src={image} alt={alt} fill unoptimized={typeof image === "string"} className="object-cover" />
    </div>
  );
}

const GarmentOptionPicker = ({ config }: { config: GarmentPickerConfig }) => {
  const { selections, setSelection } = useOptionSelection();
  const [zoom, setZoom] = useState(50);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(() => selections[config.key]?.id ?? null);
  const [items, setItems] = useState(config.items);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover-triggered tooltips are positioned relative to their scrolling
  // card, so a CSS-only :hover fade can lag a frame or two behind a fast
  // scroll and briefly render as a "ghost" detached from its card. Forcing
  // opacity to 0 directly (not just pointer-events) removes that lag —
  // the tooltip is gone the instant scrolling starts, no transition to lag.
  function handleScroll() {
    if (gridRef.current) {
      gridRef.current.style.pointerEvents = "none";
      gridRef.current.querySelectorAll<HTMLElement>(".group\\/remove").forEach((el) => {
        el.style.opacity = "0";
      });
    }
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.style.pointerEvents = "";
        gridRef.current.querySelectorAll<HTMLElement>(".group\\/remove").forEach((el) => {
          el.style.opacity = "";
        });
      }
    }, 150);
  }

  const columns = COLUMN_STOPS[Math.round(zoom / ZOOM_STEP)];
  const rc = responsiveCardText(zoom);
  const visibleItems = items.filter((item) => {
    if (sourceFilter === "all") return true;
    const isUpload = item.id.startsWith("upload-");
    return sourceFilter === "uploads" ? isUpload : !isUpload;
  });

  function handleSelect(item: GarmentItem) {
    const image = primaryImage(item);
    if (!image) return;
    setSelectedId(item.id);
    setSelection(config.key, { id: item.id, image });
  }

  function handleRemove(e: React.MouseEvent, item: GarmentItem) {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (selectedId === item.id) setSelectedId(null);
  }

  function handleAddGarment(result: GarmentUploadResult) {
    const newItem: GarmentItem = {
      id: `upload-${Date.now()}`,
      front: result.front,
      back: result.back,
      closeup: result.closeup,
    };
    setItems((prev) => [newItem, ...prev]);
    setShowUploadModal(false);
    handleSelect(newItem);
  }

  return (
    <div onScroll={handleScroll} className="w-full h-full pb-[24px] px-[20px] bg-neutral-900  overflow-y-auto no-scrollbar">
      <div className="w-full mt-[24px] rounded-[20px] bg-surface-weak border border-line-sub flex flex-col">
        <p className="text-label-lg text-strong px-[20px] pt-[24px] pb-[16px]">Choose a {config.label}</p>

        {/* This row sticks to the top of the scroll container once the title
            scrolls past it, so only the card grid keeps scrolling under it. */}
        <div className="sticky -top-[2px] z-10 bg-surface-weak px-[20px] py-[12px]">
          <div className="w-full h-[32px] flex flex-row items-center justify-between">
            <p className="text-label-sm text-white ">All {config.description}</p>
            <div className="flex flex-row gap-[24px] items-center h-full justify-center ">
              <SourceFilterDropdown value={sourceFilter} onChange={setSourceFilter} />
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
        </div>

          <div ref={gridRef} className="grid gap-[16px] px-[20px] pb-[24px] pt-[16px]" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {/* Firstcard — opens the multi-slot upload modal instead of a direct file picker */}
            <button
              onClick={() => setShowUploadModal(true)}
              className={`aspect-[5/6] relative border-[1px] border-white/50 bg-white/8 hover:bg-white-12 cursor-pointer ${
                zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
              }`}
              style={{ boxShadow: "0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset" }}
            >
              {/* Absolutely centered in the full card, independent of the
                  footer note below — neither can ever affect the other's
                  layout, however many lines either one wraps to. Every
                  size below scales with zoom so the two never collide. */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-[12px]" style={{ gap: rc.gap }}>
                <div
                  className="rounded-full flex items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
                  style={{
                    ...rc.iconBox,
                    boxShadow:
    "0 0 0.5px 0.5px var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 8px 8px -4px rgba(0, 0, 0, 0.05), " +
    "0 4px 4px -2px rgba(0, 0, 0, 0.05), " +
    "0 2px 2px -1px rgba(0, 0, 0, 0.05), " +
    "0 0 12px 0 var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 0 4px 0 var(--color-white-60, rgba(235, 237, 240, 0.60)) inset"
                  }}>
                  <svg width={rc.iconSvg} height={rc.iconSvg} viewBox="0 0 20 20" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <p style={rc.label} className="text-strong text-center">Upload new {config.label}</p>
              </div>
              <p style={rc.note} className="absolute left-0 right-0 text-sub text-center underline underline-offset-3 hover:text-strong">Photo guide</p>
            </button>

            {/* Other cards — front image as the main photo, back + closeup as small
                bottom-left thumbnails (blank placeholder card when not provided). */}
            {visibleItems.map((item) => {
              const isUpload = item.id.startsWith("upload-");
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="group aspect-[5/6] rounded-[16px] relative cursor-pointer bg-surface-white"
                >
                  <div className="absolute inset-0 rounded-[16px] overflow-hidden">
                    {item.front ? (
                      <Image
                        src={item.front}
                        alt={config.label}
                        fill
                        sizes="320px"
                        unoptimized={typeof item.front === "string"}
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-white" />
                    )}
                  </div>

                  <div className="absolute bottom-[12px] left-[12px] flex flex-row gap-[12px]">
                    <Thumb image={item.back} alt={`${config.label} back`} />
                    <Thumb image={item.closeup} alt={`${config.label} close-up`} />
                  </div>

                  {selectedId === item.id && (
                    <div className="absolute top-[12px] left-[12px] flex items-center justify-center gap-[4px] flex-row  pl-[4px] pr-[8px] py-[4px] rounded-[6px] bg-surface-light">
                      <svg  width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-strong">
                        <path d="M3.33203 7.99935L6.66536 11.3327L13.332 4.66602" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-label-xs text-[#FFFFFF]">Selected</p>
                    </div>
                  )}

                  {isUpload && (
                    <div
                      onClick={(e) => handleRemove(e, item)}
                      className="group/remove absolute top-[12px] right-[12px] w-[24px] h-[24px] rounded-full bg-black-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <svg  width="16" height="16" viewBox="0 0 16 16" fill="none">
                       <path d="M12 4L4 12M4 4L12 12" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div className="absolute bottom-full mb-[8px] right-0 z-20 whitespace-nowrap text-white text-label-xs bg-surface-light px-[6px] py-[4px] rounded-[6px] opacity-0 group-hover/remove:opacity-100 transition-opacity duration-150 pointer-events-none">
                        Remove image
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
      </div>

      {showUploadModal && (
        <UploadGarmentModal
          label={config.label}
          onClose={() => setShowUploadModal(false)}
          onAdd={handleAddGarment}
        />
      )}
    </div>
  );
};

export default GarmentOptionPicker;
