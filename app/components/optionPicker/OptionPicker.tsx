"use client";
import { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useOptionSelection } from "@/app/context/option-selection-context";
import SourceFilterDropdown, { SourceFilter } from "./SourceFilterDropdown";
import ColorPickerModal from "./ColorPickerModal";
import { useMaxFitColumns, capAndDedupe } from "./useResponsiveColumns";
import { useIsLargeScreen } from "./useIsLargeScreen";
import { useZoom } from "@/app/context/zoom-context";

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
  // Shown instead of uploadNote only at the narrowest card size (small-screen
  // scheme at zoom 0) — falls back to uploadNote if omitted.
  uploadNoteShort?: string;
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
// Screens above 1441px get the fuller 5-stop range (matches the Gallery
// page). At/below 1441px, cards enforcing a 184px min-width don't have room
// for 5-6 distinct column counts without stops collapsing into duplicates,
// so that range is reduced to 3 stops instead. Even within the "large" tier,
// the raw array is further capped+deduped against the container's
// actually-measured capacity (see capAndDedupe/useMaxFitColumns) — the
// 1441px breakpoint alone isn't a reliable proxy for "room for 6 distinct
// columns" once sidebar/right-panel width is accounted for, and without
// this a screen just above 1441px can silently clamp two adjacent zoom
// stops down to the same column count, making the slider look like it does
// nothing.
const MIN_CARD_WIDTH = 184; // px — matches every card's own min-w-[184px] class below
const COLUMN_STOPS_LARGE = [6, 5, 4, 3, 2];
const COLUMN_STOPS_SMALL = [4, 3, 2];

// ---- First-card sizing (Upload / Create custom color / Auto) ----
// Designer spec: these stay FIXED at every zoom level — no shrinking as
// columns get denser. Edit these numbers to restyle every first-card at
// once; nothing else in this file needs to change.
const FIRST_CARD_ICON_SIZE = 32; // px — the circular icon button (width & height)
const FIRST_CARD_ICON_LABEL_GAP = 12; // px — gap between the icon and its label
// Cards WITHOUT a custom note (the default "Photo guide" link — Face,
// Bottom, Footwear, Top, etc): icon+label stays independently centered, and
// the link is pinned this many px from the card's bottom edge instead.
const FIRST_CARD_GUIDE_BOTTOM = 32; // px

const OptionPicker = ({ config, onSelect,}: {config: OptionPickerConfig;onSelect?: (item: OptionPickerItem) => void;}) => {
  const { selections, setSelection } = useOptionSelection();
  const isLargeScreen = useIsLargeScreen();
  // Shared across every option-picker page so the zoom the user picks on
  // one page (e.g. Pose) carries over instead of resetting on the next.
  const { zoom, setZoom } = useZoom();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  // Restores the "Selected" badge from the shared context so navigating away
  // and back (without a full reload) doesn't make the selection look lost.
  const [selectedId, setSelectedId] = useState<string | null>(() => selections[config.key]?.id ?? null);
  const [items, setItems] = useState(config.items);
  const [showColorModal, setShowColorModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const maxFitColumns = useMaxFitColumns(gridRef, MIN_CARD_WIDTH);
  const COLUMN_STOPS = capAndDedupe(isLargeScreen ? COLUMN_STOPS_LARGE : COLUMN_STOPS_SMALL, maxFitColumns);
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

  // Pose's note is pinned this many px from the card's bottom edge — fewer
  // columns per row (more zoomed out) means less room, so the offset steps
  // down at a per-screen-size threshold: the large 5-stop range only has
  // "zoom === 0" as its most-zoomed-out state, while the small 3-stop range
  // covers two stops (0 and 50) at that same low-density end.
  const noteBottomOffset = isLargeScreen ? (zoom === 0 ? 24 : 32) : (zoom <= 50 ? 24 : 32);
  // The small-screen scheme's zoom-0 stop is the one card size (~184px)
  // narrow enough that the full note text wraps to 3 lines and pushes past
  // the card's bottom edge — swap in the shorter version there only.
  const isTightNote = !isLargeScreen && zoom === 0;
  const uploadNoteText = isTightNote ? (config.uploadNoteShort ?? config.uploadNote) : config.uploadNote;

  const stopIndex = Math.min(Math.round((zoom / 100) * (COLUMN_STOPS.length - 1)), COLUMN_STOPS.length - 1);
  const columns = COLUMN_STOPS[stopIndex];
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
                step={1}
                value={zoom}
                onChange={(e) => {
                  // The number of stops depends on the current container
                  // width, so 100/(stops-1) can be a non-integer (e.g. a
                  // 4-stop array gives 33.33) — using that as the native
                  // `step` would resurrect the exact "last value
                  // unreachable" float bug this project already fixed once.
                  // Snapping to the nearest stop in JS instead keeps the
                  // same discrete feel without depending on native step math.
                  const raw = Number(e.target.value);
                  const idx = Math.round((raw / 100) * (COLUMN_STOPS.length - 1));
                  setZoom((idx / (COLUMN_STOPS.length - 1)) * 100);
                }}
                className="zoom-slider w-[96px] h-[4px]"
                style={{
                  background: `linear-gradient(to right, #DAECF5 0%, #DAECF5 ${zoom}%, rgba(218, 236, 245, 0.15) ${zoom}%, rgba(218, 236, 245, 0.15) 100%)`,
                }}
              />

              <p className="w-[27px] h-full flex items-center justify-end text-sub text-label-sm ">{Math.round(zoom)}</p>
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
                className={`aspect-[5/6] min-w-[184px] relative border border-white/50 bg-white/8 hover:bg-white-12 cursor-pointer ${
                  "rounded-[16px] min-[1441px]:rounded-[24px]"
                }`}
                style={{boxShadow:"0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset"}}>
                {/* Fixed sizing (see FIRST_CARD_* constants above) — no
                    shrinking with zoom. */}
                {config.uploadNote ? (
                  <>
                    {/* Custom note (e.g. Pose): the icon+label wrap stays
                        absolutely centered in the card at all times (its
                        position never shifts with the note's length); the
                        note is a separate element pinned noteBottomOffset px
                        from the card's bottom edge instead, so neither can
                        push the other. */}
                    <div
                      className="absolute left-1/2 top-1/2 flex flex-col items-center px-[12px]"
                      style={{ gap: FIRST_CARD_ICON_LABEL_GAP, transform: "translate(-50%, -50%)" }}
                    >
                        <div className="rounded-full flex items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
                        style={{
                          width: FIRST_CARD_ICON_SIZE,
                          height: FIRST_CARD_ICON_SIZE,
                          padding: 6,
                          boxShadow:
    "0 0 0.5px 0.5px var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 8px 8px -4px rgba(0, 0, 0, 0.05), " +
    "0 4px 4px -2px rgba(0, 0, 0, 0.05), " +
    "0 2px 2px -1px rgba(0, 0, 0, 0.05), " +
    "0 0 12px 0 var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 0 4px 0 var(--color-white-60, rgba(235, 237, 240, 0.60)) inset"
                        }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white"/>
                       </svg>
                      </div>
                      <p className="text-label-sm text-strong text-center whitespace-nowrap">{config.uploadLabel ?? `Upload new ${config.label}`}</p>
                    </div>
                    <p
                      className="absolute left-0 right-0 text-paragraph-xs text-sub text-center whitespace-pre-line px-[12px]"
                      style={{ bottom: noteBottomOffset }}
                    >
                      {uploadNoteText}
                    </p>
                  </>
                ) : (
                  <>
                    {/* Default "Photo guide": icon+label stays independently
                        centered in the card; the link is a separate element
                        pinned 32px from the bottom at every zoom level, so
                        neither can push the other. */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-[12px]" style={{ gap: FIRST_CARD_ICON_LABEL_GAP }}>
                      <div className="rounded-full flex items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
                      style={{
                        width: FIRST_CARD_ICON_SIZE,
                        height: FIRST_CARD_ICON_SIZE,
                        padding: 6,
                        boxShadow:
    "0 0 0.5px 0.5px var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 8px 8px -4px rgba(0, 0, 0, 0.05), " +
    "0 4px 4px -2px rgba(0, 0, 0, 0.05), " +
    "0 2px 2px -1px rgba(0, 0, 0, 0.05), " +
    "0 0 12px 0 var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 0 4px 0 var(--color-white-60, rgba(235, 237, 240, 0.60)) inset"
                      }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white"/>
                     </svg>
                    </div>
                    <p className="text-label-sm text-strong text-center whitespace-nowrap">{config.uploadLabel ?? `Upload new ${config.label}`}</p>
                    </div>
                    <p className="absolute left-0 right-0 text-label-xs text-sub text-center underline underline-offset-3 hover:text-strong" style={{ bottom: FIRST_CARD_GUIDE_BOTTOM }}>Photo guide</p>
                  </>
                )}
              </button>
            </>
          )}


          {config.colorPickerEnabled && (
            <button
              onClick={() => setShowColorModal(true)}
              className={`aspect-[5/6] min-w-[184px] relative border border-white/50 bg-white/8 hover:bg-white-12 flex flex-col items-center justify-center cursor-pointer ${
                "rounded-[16px] min-[1441px]:rounded-[24px]"
              }`}
              style={{boxShadow:"0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset"}}>
              <div className="flex flex-col items-center justify-center px-[12px]" style={{ gap: FIRST_CARD_ICON_LABEL_GAP }}>
                  <div className="rounded-full flex items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
                  style={{
                    width: FIRST_CARD_ICON_SIZE,
                    height: FIRST_CARD_ICON_SIZE,
                    padding: 6,
                    boxShadow:
    "0 0 0.5px 0.5px var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 8px 8px -4px rgba(0, 0, 0, 0.05), " +
    "0 4px 4px -2px rgba(0, 0, 0, 0.05), " +
    "0 2px 2px -1px rgba(0, 0, 0, 0.05), " +
    "0 0 12px 0 var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 0 4px 0 var(--color-white-60, rgba(235, 237, 240, 0.60)) inset"
                  }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white"/>
                 </svg>
                </div>
                <p className="text-label-sm text-strong text-center">Create custom color</p>
              </div>
            </button>
          )}

          {config.autoOption && (
            <button
              onClick={handleSelectAuto}
              className={`aspect-[5/6] min-w-[184px] relative border-[2px] hover:bg-surface-alpha-light-soft hover:border-line-strong flex flex-col items-center justify-center cursor-pointer ${selectedId===AUTO_ID?"bg-surface-alpha-light-soft border-line-strong":"border-line-sub"} ${
                "rounded-[16px] min-[1441px]:rounded-[24px]"
              }`}>
              <div className="flex flex-col items-center justify-center gap-[8px] px-[12px]">
                <p className="text-label-sm text-strong text-center">{config.autoOption.title}</p>
                <p className="text-paragraph-sm text-sub text-center">{config.autoOption.subtitle}</p>
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
                className="group aspect-[5/6] min-w-[184px] rounded-[16px] min-[1441px]:rounded-[24px] relative cursor-pointer"
              >
                <div className="absolute inset-0 rounded-[16px] min-[1441px]:rounded-[24px] overflow-hidden">
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
                    <div className="absolute bottom-full mb-[4px] left-1/2 -translate-x-1/2 z-20 whitespace-nowrap text-white text-label-xs bg-surface-light px-[6px] py-[4px] rounded-[6px] opacity-0 group-hover/remove:opacity-100 transition-opacity duration-150 pointer-events-none">
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
