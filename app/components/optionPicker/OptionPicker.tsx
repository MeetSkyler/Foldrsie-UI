"use client";
import { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useOptionSelection } from "@/app/context/option-selection-context";
import SourceFilterDropdown, { SourceFilter } from "./SourceFilterDropdown";
import ColorPickerModal from "./ColorPickerModal";

export type OptionPickerItem = {
  id: string;
  label?: string;
  // Exactly one of these — a photo item, or a solid color swatch.
  image?: StaticImageData | string;
  color?: string;
};

export type OptionPickerConfig = {
  key: string;
  label: string;
  description:string; // singular, e.g. "face", "pose" — drives "Choose a {label}" / "All {label}s"
  categories?: string[]; // options for the "All" dropdown filter
  items: OptionPickerItem[];
  uploadEnabled?: boolean;
  // Overrides for the upload card's copy — defaults to "Upload new {label}"
  // and a "Photo guide" link when omitted.
  uploadLabel?: string;
  uploadNote?: string;
  // A selectable (non-upload) first card, e.g. "Auto / Choose for me".
  // Selecting it clears any image override for this option's sidebar icon,
  // so the icon box falls back to its default look.
  autoOption?: { title: string; subtitle: string };
  // First card opens a color-picker modal instead of a file picker; the
  // chosen hex becomes a new solid-color card.
  colorPickerEnabled?: boolean;
};

const AUTO_ID = "auto";

// A pixel-size-driven grid (auto-fill/minmax) can keep the same column count
// across a wide range of slider values, so dragging feels "dead" in between —
// the user sees no change until they cross a hidden threshold. Instead, each
// zoom stop maps directly to an explicit column count, so every stop the
// slider can land on is guaranteed to look different from its neighbors,
// regardless of container width.
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
    // In-flow secondary text (e.g. the auto card's subtitle).
    subtitle: {
      fontSize: `${noteFontSize}px`,
      lineHeight: `${noteFontSize * 1.15}px`,
    } as React.CSSProperties,
    // Same type scale, but pinned to the card's bottom edge.
    note: {
      fontSize: `${noteFontSize}px`,
      lineHeight: `${noteFontSize * 1.15}px`,
      bottom: `${10 + t * 24}px`, // 10px -> 34px
    } as React.CSSProperties,
  };
}

const OptionPicker = ({ config, onSelect,}: {config: OptionPickerConfig;onSelect?: (item: OptionPickerItem) => void;}) => {
  const { selections, setSelection } = useOptionSelection();
  const [zoom, setZoom] = useState(50); // must land on a ZOOM_STEP multiple
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  // Restores the "Selected" badge from the shared context so navigating away
  // and back (without a full reload) doesn't make the selection look lost.
  const [selectedId, setSelectedId] = useState<string | null>(() => selections[config.key]?.id ?? null);
  const [items, setItems] = useState(config.items);
  const [showColorModal, setShowColorModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
  // Shared by all three "first card" variants below (upload / color picker /
  // auto), so each one shrinks consistently as the grid gets denser.
  const rc = responsiveCardText(zoom);
  const visibleItems = items.filter((item) => {
    if (sourceFilter === "all") return true;
    const isUserAdded = item.id.startsWith("upload-") || item.id.startsWith("color-");
    return sourceFilter === "uploads" ? isUserAdded : !isUserAdded;
  });

  function handleSelect(item: OptionPickerItem) {
    setSelectedId(item.id);
    setSelection(config.key, item.color ? { id: item.id, color: item.color } : { id: item.id, image: item.image });
    onSelect?.(item);
  }

  function handleAddColor(hex: string) {
    const newItem: OptionPickerItem = { id: `color-${Date.now()}`, color: hex };
    setItems((prev) => [newItem, ...prev]);
    setShowColorModal(false);
    handleSelect(newItem);
  }

  function handleSelectAuto() {
    setSelectedId(AUTO_ID);
    setSelection(config.key, null);
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const newItem: OptionPickerItem = {
      id: `upload-${Date.now()}`,
      label: file.name,
      image: URL.createObjectURL(file),
    };
    setItems((prev) => [newItem, ...prev]);
    handleSelect(newItem);
    e.target.value = "";
  }

  function handleRemove(e: React.MouseEvent, item: OptionPickerItem) {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (selectedId === item.id) setSelectedId(null);
  }

  return (
    <div onScroll={handleScroll} className="w-full h-full pb-[24px] px-[20px] bg-neutral-900  overflow-y-auto no-scrollbar">
      <div className=" w-full mt-[24px] rounded-[20px] bg-surface-weak border border-line-sub flex flex-col ">
       <p className="text-label-lg text-strong px-[20px] pt-[24px] pb-[16px]">Choose a {config.label}</p>

        {/* This row sticks to the top of the scroll container once the title
            scrolls past it, so only the card grid keeps scrolling under it. */}
        <div className="sticky -top-[2px] z-10 bg-surface-weak px-[20px] py-[12px]">
        <div className="w-full h-[32px] flex flex-row items-center justify-between">
          <p className="text-label-sm text-white">All {config.description}</p>
          <div className="flex flex-row gap-[24px] items-center h-full justify-center ">
            <SourceFilterDropdown value={sourceFilter} onChange={setSourceFilter} />
            {/* ...range bar .... */}
            <div className="h-full  py-[6px] flex flex-row items-center justify-center gap-[12px]">

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

        {/* Column count comes straight from the current zoom stop — always a
            different number of columns than the adjacent stops. */}
        <div
          ref={gridRef}
          className="grid gap-[16px] px-[20px] pb-[24px] pt-[16px]"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >



          {/* Firstcard */}
          {config.uploadEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                className={`aspect-[5/6] relative border border-white/50 bg-white/8 hover:bg-white-12 cursor-pointer ${
                  zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
                }`}
                style={{boxShadow:"0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset"}}>
                {/* Absolutely centered in the full card, independent of the
                    footer note below — neither can ever affect the other's
                    layout, however many lines either one wraps to. Every
                    size below scales with zoom so the two never collide. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-[12px]" style={{ gap: rc.gap }}>

                  <div className="rounded-full flex items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
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
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white"/>
                 </svg>
                </div>

                <p style={rc.label} className="text-strong text-center">{config.uploadLabel ?? `Upload new ${config.label}`}</p>
                </div>
                {config.uploadNote ? (
                  <p style={rc.note} className="absolute left-0 right-0 text-sub text-center px-[12px]">{config.uploadNote}</p>
                ) : (
                  <p style={rc.note} className="absolute left-0 right-0 text-sub text-center underline underline-offset-3 hover:text-strong">Photo guide</p>
                )}
              </button>
            </>
          )}


          {config.colorPickerEnabled && (
            <button
              onClick={() => setShowColorModal(true)}
              className={`aspect-[5/6] relative border border-white/50 bg-white/8 hover:bg-white-12 flex flex-col items-center justify-center cursor-pointer ${
                zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
              }`}
              style={{boxShadow:"0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset"}}>
              <div className="flex flex-col items-center justify-center px-[12px]" style={{ gap: rc.gap }}>
                  <div className="rounded-full flex items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
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
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white"/>
                 </svg>
                </div>
                <p style={rc.label} className="text-strong text-center">Create custom color</p>
              </div>
            </button>
          )}

          {config.autoOption && (
            <button
              onClick={handleSelectAuto}
              className={`aspect-[5/6] relative border-[2px]  flex flex-col items-center justify-center cursor-pointer ${selectedId===AUTO_ID?"bg-surface-alpha-light-soft border-line-strong":"border-line-sub"} ${
                zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
              }`}>
              <div className="flex flex-col items-center justify-center px-[12px]" style={{ gap: rc.gap }}>
                <p style={rc.label} className="text-strong text-center">{config.autoOption.title}</p>
                <p style={rc.subtitle} className="text-sub text-center">{config.autoOption.subtitle}</p>
              </div>

              {selectedId === AUTO_ID && (
                <div className="absolute top-[12px] flex items-center justify-center gap-[4px] flex-row left-[12px] pl-[4px] pr-[8px] py-[4px] rounded-[6px] bg-surface-light">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-strong">
                    <path d="M3.33203 7.99935L6.66536 11.3327L13.332 4.66602" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-label-xs text-[#FFFFFF]">Selected</p>
                </div>
              )}
            </button>
          )}

          {/* other cards */}
          {visibleItems.map((item) => {
            const isRemovable = item.id.startsWith("upload-") || item.id.startsWith("color-");
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="group aspect-[5/6] rounded-[16px] relative cursor-pointer"
              >
                <div className="absolute inset-0 rounded-[16px] overflow-hidden">
                  {item.color ? (
                    <div className="absolute inset-0" style={{ background: item.color }} />
                  ) : (
                    <Image
                      src={item.image!}
                      alt={item.label ?? config.label}
                      fill
                      sizes="320px"
                      unoptimized={typeof item.image === "string"}
                      className="object-cover"
                    />
                  )}
                </div>

                {selectedId === item.id && (
                  <div className="absolute top-[12px] flex items-center justify-center gap-[4px] flex-row left-[12px] pl-[4px] pr-[8px] py-[4px] rounded-[6px] bg-surface-light">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-strong">
                      <path d="M3.33203 7.99935L6.66536 11.3327L13.332 4.66602" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-label-xs text-[#FFFFFF]">Selected</p>
                  </div>
                )}

                {isRemovable && (
                  <div
                    onClick={(e) => handleRemove(e, item)}
                    className="group/remove absolute top-[12px] right-[12px] w-[24px] h-[24px] rounded-full bg-black-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

       {/* BottomOptionsCard */}

      </div>

      {showColorModal && (
        <ColorPickerModal onClose={() => setShowColorModal(false)} onAdd={handleAddColor} />
      )}
    </div>
  );
};

export default OptionPicker;
