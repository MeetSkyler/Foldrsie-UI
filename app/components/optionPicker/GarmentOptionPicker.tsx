"use client";
import { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useOptionSelection } from "@/app/context/option-selection-context";
import UploadGarmentModal, { GarmentUploadResult } from "./UploadGarmentModal";
import SourceFilterDropdown, { SourceFilter } from "./SourceFilterDropdown";
import { useResponsiveColumns } from "./useResponsiveColumns";

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

// Only uploaded items (always string blob URLs, never a static import) are
// ever reopened for editing, so this coercion is safe in practice — it just
// satisfies GarmentUploadResult's narrower (string-only) field types.
function toUploadResult(item: GarmentItem): GarmentUploadResult {
  return {
    front: typeof item.front === "string" ? item.front : undefined,
    back: typeof item.back === "string" ? item.back : undefined,
    closeup: typeof item.closeup === "string" ? item.closeup : undefined,
  };
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
// 3 stops — with cards enforcing a 184px min-width, denser stops (5/6, and
// even a 4th stop down to 1 column) collapse into the same clamped column
// count as a neighboring stop (see useResponsiveColumns), so both were
// dropped. Keep this at 3 (or another divisor of 100 like 5) — ZOOM_STEP
// must divide 100 with zero floating-point remainder, or the native slider's
// own step math (floor((max-min)/step)) rounds down a full step short and
// the last stop becomes permanently unreachable by drag/keyboard.
const COLUMN_STOPS = [4, 3, 2];
const ZOOM_STEP = 100 / (COLUMN_STOPS.length - 1);

// ---- First-card sizing (Upload) ----
// Designer spec: these stay FIXED at every zoom level — no shrinking as
// columns get denser. Mirrors OptionPicker.tsx's FIRST_CARD_* constants.
// Icon+label stays independently centered in the card; the "Photo guide"
// link is a separate element pinned this many px from the bottom edge.
const FIRST_CARD_ICON_SIZE = 32; // px — the circular icon button (width & height)
const FIRST_CARD_ICON_LABEL_GAP = 12; // px — gap between the icon and its label
const FIRST_CARD_GUIDE_BOTTOM = 32; // px — distance from the card's bottom edge to the "Photo guide" link

function Thumb({
  image,
  alt,
  onClickMissing,
}: {
  image: StaticImageData | string | undefined;
  alt: string;
  // Only set for user-uploaded items — clicking a blank thumbnail reopens
  // the upload modal, pre-filled with whichever angles already exist, so
  // the user can fill in just the missing one(s).
  onClickMissing?: () => void;
}) {
  if (!image) {
    return (
      <div
        onClick={
          onClickMissing
            ? (e) => {
                e.stopPropagation();
                onClickMissing();
              }
            : undefined
        }
        className={`w-[41px] h-[50px] rounded-[8px] bg-surface-white border-[1.5px] border-[#FFFFFF] ${onClickMissing ? "cursor-pointer" : ""}`}
        style={{boxShadow:" 0 0 0 1.4px rgba(0, 0, 0, 0.08), 0 8px 8px -4px rgba(0, 0, 0, 0.07), 0 6px 6px -3px rgba(0, 0, 0, 0.07), 0 4px 4px -2px rgba(0, 0, 0, 0.04), 0 2px 2px -1px rgba(0, 0, 0, 0.04)"}}
      />
    );
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
  const [zoom, setZoom] = useState(ZOOM_STEP); // must land on a ZOOM_STEP multiple
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(() => selections[config.key]?.id ?? null);
  const [items, setItems] = useState(config.items);
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Set when the upload modal was reopened from a card missing an angle
  // (instead of the "Upload new {label}" first card) — the save handler
  // then updates this item in place instead of creating a new one.
  const [editingItem, setEditingItem] = useState<GarmentItem | null>(null);
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

  const desiredColumns = COLUMN_STOPS[Math.round(zoom / ZOOM_STEP)];
  const columns = useResponsiveColumns(gridRef, desiredColumns);
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

  // Reopens the upload modal for an existing uploaded item that's missing
  // an angle — only wired up for isUpload cards (never default catalog
  // items), so this is unreachable for anything but the user's own uploads.
  function handleEditMissing(item: GarmentItem) {
    setEditingItem(item);
    setShowUploadModal(true);
  }

  function closeUploadModal() {
    setShowUploadModal(false);
    setEditingItem(null);
  }

  function handleSaveGarment(result: GarmentUploadResult) {
    if (editingItem) {
      // Reflects the modal's final slot state as-is — a pre-filled slot the
      // user left untouched stays, one they removed becomes missing again,
      // and a previously-empty one now has the newly uploaded image.
      const updated: GarmentItem = { ...editingItem, front: result.front, back: result.back, closeup: result.closeup };
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
      if (selectedId === editingItem.id) {
        setSelection(config.key, { id: updated.id, image: primaryImage(updated) });
      }
      closeUploadModal();
      return;
    }

    const newItem: GarmentItem = {
      id: `upload-${Date.now()}`,
      front: result.front,
      back: result.back,
      closeup: result.closeup,
    };
    setItems((prev) => [newItem, ...prev]);
    closeUploadModal();
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
                <p className="w-[27px] h-full flex items-center justify-end text-sub text-label-sm ">{Math.round(zoom)}</p>
              </div>
            </div>
          </div>
        </div>

          <div ref={gridRef} className="grid gap-[16px] px-[20px] pb-[24px] pt-[16px]" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {/* Firstcard — opens the multi-slot upload modal instead of a direct file picker */}
            <button
              onClick={() => {
                setEditingItem(null);
                setShowUploadModal(true);
              }}
              className={`aspect-[5/6] min-w-[184px] relative border-[1px] border-white/50 bg-white/8 hover:bg-white-12 cursor-pointer ${
                zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
              }`}
              style={{ boxShadow: "0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset" }}
            >
              {/* Fixed sizing (see FIRST_CARD_* constants above) — no
                  shrinking with zoom. Icon+label stays independently
                  centered in the card; the link below is a separate element
                  pinned to the bottom edge, so neither can push the other. */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-[12px]" style={{ gap: FIRST_CARD_ICON_LABEL_GAP }}>
                <div
                  className="rounded-full flex items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
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
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <p className="text-label-sm text-strong text-center">Upload new {config.label}</p>
              </div>
              <p className="absolute left-0 right-0 text-label-xs text-sub text-center underline underline-offset-3 hover:text-strong" style={{ bottom: FIRST_CARD_GUIDE_BOTTOM }}>Photo guide</p>
            </button>

            {/* Other cards — front image as the main photo, back + closeup as small
                bottom-left thumbnails (blank placeholder card when not provided). */}
            {visibleItems.map((item) => {
              const isUpload = item.id.startsWith("upload-");
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="group aspect-[5/6] min-w-[184px] rounded-[16px] relative cursor-pointer bg-surface-white"
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
                    <Thumb
                      image={item.back}
                      alt={`${config.label} back`}
                      onClickMissing={isUpload ? () => handleEditMissing(item) : undefined}
                    />
                    <Thumb
                      image={item.closeup}
                      alt={`${config.label} close-up`}
                      onClickMissing={isUpload ? () => handleEditMissing(item) : undefined}
                    />
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
                      <div className="absolute bottom-full mb-[4px] left-1/2 -translate-x-1/2 z-20 whitespace-nowrap text-white text-label-xs bg-surface-light px-[6px] py-[4px] rounded-[6px] opacity-0 group-hover/remove:opacity-100 transition-opacity duration-150 pointer-events-none">
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
          initial={editingItem ? toUploadResult(editingItem) : undefined}
          onClose={closeUploadModal}
          onAdd={handleSaveGarment}
        />
      )}
    </div>
  );
};

export default GarmentOptionPicker;
