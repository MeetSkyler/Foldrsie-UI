"use client";
import { useLayoutEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useOptionSelection } from "@/app/context/option-selection-context";
import SourceFilterDropdown, { SourceFilter } from "./SourceFilterDropdown";
import ColorPickerModal from "./ColorPickerModal";
import { useResponsiveColumns } from "./useResponsiveColumns";

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
  // Gap (px) between the icon+label group and uploadNote — defaults to
  // FIRST_CARD_NOTE_GAP. Only meaningful when uploadNote is set.
  uploadNoteGap?: number;
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
// 3 stops — with cards enforcing a 184px min-width, denser stops (5/6, and
// even a 4th stop down to 1 column) collapse into the same clamped column
// count as a neighboring stop (see useResponsiveColumns), so both were
// dropped. Keep this at 3 (or another divisor of 100 like 5) — ZOOM_STEP
// must divide 100 with zero floating-point remainder, or the native slider's
// own step math (floor((max-min)/step)) rounds down a full step short and
// the last stop becomes permanently unreachable by drag/keyboard.
const COLUMN_STOPS = [4, 3, 2];
const ZOOM_STEP = 100 / (COLUMN_STOPS.length - 1);

// ---- First-card sizing (Upload / Create custom color / Auto) ----
// Designer spec: these stay FIXED at every zoom level — no shrinking as
// columns get denser. Edit these numbers to restyle every first-card at
// once; nothing else in this file needs to change.
const FIRST_CARD_ICON_SIZE = 32; // px — the circular icon button (width & height)
const FIRST_CARD_ICON_LABEL_GAP = 12; // px — gap between the icon and its label
// Cards WITH a custom config.uploadNote (currently only Pose): icon+label+
// note move together as one centered group — this is the gap between the
// icon-label block and the note, unless config.uploadNoteGap overrides it
// (Pose sets 51px).
const FIRST_CARD_NOTE_GAP = 29; // px
// Cards WITHOUT a custom note (the default "Photo guide" link — Face,
// Bottom, Footwear, Top, etc): icon+label stays independently centered, and
// the link is pinned this many px from the card's bottom edge instead.
const FIRST_CARD_GUIDE_BOTTOM = 32; // px

const OptionPicker = ({ config, onSelect,}: {config: OptionPickerConfig;onSelect?: (item: OptionPickerItem) => void;}) => {
  const { selections, setSelection } = useOptionSelection();
  const [zoom, setZoom] = useState(ZOOM_STEP); // must land on a ZOOM_STEP multiple
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  // Restores the "Selected" badge from the shared context so navigating away
  // and back (without a full reload) doesn't make the selection look lost.
  const [selectedId, setSelectedId] = useState<string | null>(() => selections[config.key]?.id ?? null);
  const [items, setItems] = useState(config.items);
  const [showColorModal, setShowColorModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Measures the icon+label wrap on the uploadNote first-card (Pose) so the
  // note below it can be positioned from the wrap's actual height, instead
  // of the wrap and note sharing one flex-centered group — which shifted the
  // icon+label off-center whenever the note's line count changed.
  const noteWrapRef = useRef<HTMLDivElement | null>(null);
  const [noteWrapHalfHeight, setNoteWrapHalfHeight] = useState(0);

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

  useLayoutEffect(() => {
    if (!config.uploadNote) return;
    const el = noteWrapRef.current;
    if (!el) return;
    setNoteWrapHalfHeight(el.getBoundingClientRect().height / 2);
  }, [config.uploadNote, config.uploadLabel, zoom]);

  const desiredColumns = COLUMN_STOPS[Math.round(zoom / ZOOM_STEP)];
  const columns = useResponsiveColumns(gridRef, desiredColumns);
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
                  zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
                }`}
                style={{boxShadow:"0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset"}}>
                {/* Fixed sizing (see FIRST_CARD_* constants above) — no
                    shrinking with zoom. */}
                {config.uploadNote ? (
                  <>
                    {/* Custom note (e.g. Pose): the icon+label wrap stays
                        absolutely centered in the card at all times (its
                        position never shifts with the note's length); the
                        note is positioned below it using the wrap's actual
                        measured height plus config.uploadNoteGap (or
                        FIRST_CARD_NOTE_GAP), instead of the two sharing one
                        flex-centered group. */}
                    <div
                      ref={noteWrapRef}
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
                      <p className="text-label-sm text-strong text-center">{zoom === 0 ? "Upload" : (config.uploadLabel ?? `Upload new ${config.label}`)}</p>
                    </div>
                    <p
                      className="absolute left-0 right-0 text-paragraph-xs text-sub text-center whitespace-pre-line px-[12px]"
                      style={{
                        top: "50%",
                        transform: `translateY(${noteWrapHalfHeight + (config.uploadNoteGap ?? FIRST_CARD_NOTE_GAP)}px)`,
                      }}
                    >
                      {config.uploadNote}
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
                    <p className="text-label-sm text-strong text-center">{zoom === 0 ? "Upload" : (config.uploadLabel ?? `Upload new ${config.label}`)}</p>
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
                zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
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
                <p className="text-label-sm text-strong text-center">{zoom === 0 ? "Upload" : "Create custom color"}</p>
              </div>
            </button>
          )}

          {config.autoOption && (
            <button
              onClick={handleSelectAuto}
              className={`aspect-[5/6] min-w-[184px] relative border-[2px]  flex flex-col items-center justify-center cursor-pointer ${selectedId===AUTO_ID?"bg-surface-alpha-light-soft border-line-strong":"border-line-sub"} ${
                zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
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
                className="group aspect-[5/6] min-w-[184px] rounded-[16px] relative cursor-pointer"
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
