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

  const columns = COLUMN_STOPS[Math.round(zoom / ZOOM_STEP)];
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
    <div className="w-full h-full pb-[24px] px-[20px] bg-neutral-900  overflow-y-auto no-scrollbar">
      <div className=" w-full mt-[24px] rounded-[24px] bg-surface-weak border border-line-sub flex flex-col ">
       <p className="text-label-lg text-strong px-[20px] pt-[24px] pb-[16px]">Choose a {config.label}</p>

        {/* This row sticks to the top of the scroll container once the title
            scrolls past it, so only the card grid keeps scrolling under it. */}
        <div className="sticky top-0 z-10 bg-surface-weak px-[20px] py-[12px]">
        <div className="w-full h-[32px] flex flex-row items-center justify-between">
          <p className="text-label-sm text-white">All {config.description}</p>
          <div className="flex flex-row gap-[24px] items-center h-full justify-center ">
            <SourceFilterDropdown value={sourceFilter} onChange={setSourceFilter} />
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
                className={`aspect-[5/6] relative border border-white/30 bg-white/8 flex flex-col items-center justify-center cursor-pointer ${
                  zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
                }`}
                style={{boxShadow:"0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset"}}>
                <div className="flex flex-col items-center justify-center gap-[12px]">

                  <div className="w-[32px] h-[32px] rounded-full flex p-[6px] items-center justify-center text-strong text-[20px] leading-none"
                  style={{ boxShadow:
    "0 0 0.5px 0.5px var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 8px 8px -4px rgba(0, 0, 0, 0.05), " +
    "0 4px 4px -2px rgba(0, 0, 0, 0.05), " +
    "0 2px 2px -1px rgba(0, 0, 0, 0.05), " +
    "0 0 12px 0 var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 0 4px 0 var(--color-white-60, rgba(235, 237, 240, 0.60)) inset"
,
                    background:"var(--color-neutral-500),rgba(235, 237, 240, 0.08)"
                    //  0 0 0.5px 0.5px var(--Neutrals-Alpha-White-20, rgba(235, 237, 240, 0.20)) inset, 0 8px 8px -4px rgba(0, 0, 0, 0.05), 0 4px 4px -2px rgba(0, 0, 0, 0.05), 0 2px 2px -1px rgba(0, 0, 0, 0.05), 0 0 12px 0 var(--Neutrals-Alpha-White-20, rgba(235, 237, 240, 0.20)) inset, 0 0 4px 0 var(--Neutrals-Alpha-White-60, rgba(235, 237, 240, 0.60)) inset
                  }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white"/>
                 </svg>
                </div>

                <p className="text-label-sm text-strong">Upload new {config.label}</p>
                </div>
                <p className="text-label-xs text-sub absolute bottom-[32.4px] underline underline-offset-3 hover:text-strong">Photo guide</p>
              </button>
            </>
          )}

          {config.colorPickerEnabled && (
            <button
              onClick={() => setShowColorModal(true)}
              className={`aspect-[5/6] relative border border-white/30 bg-white/8 flex flex-col items-center justify-center cursor-pointer ${
                zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
              }`}
              style={{boxShadow:"0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset"}}>
              <div className="flex flex-col items-center justify-center gap-[12px]">
                <div
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-strong text-[20px] leading-none"
                  style={{
                    background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                  }}
                />
                <p className="text-label-sm text-strong">Create custom color</p>
              </div>
            </button>
          )}

          {config.autoOption && (
            <button
              onClick={handleSelectAuto}
              className={`aspect-[5/6] relative border-[2px]  flex flex-col items-center justify-center cursor-pointer ${selectedId===AUTO_ID?"bg-surface-alpha-light-soft border-line-strong":"border-line-sub"} ${
                zoom === 0 ? "rounded-[16px]" : "rounded-[24px]"
              }`}>
              <div className="flex flex-col items-center justify-center gap-[8px]">
                <p className="text-label-sm text-strong">{config.autoOption.title}</p>
                <p className="text-paragraph-sm text-sub">{config.autoOption.subtitle}</p>
              </div>

              {selectedId === AUTO_ID && (
                <div className="absolute top-[8px] left-[8px] px-[8px] py-[4px] rounded-[6px] bg-black-80 text-label-xs text-white">
                  Selected
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
                className="group aspect-[5/6] rounded-[16px] overflow-hidden relative cursor-pointer"
              >
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

                {selectedId === item.id && (
                  <div className="absolute top-[8px] left-[8px] px-[8px] py-[4px] rounded-[6px] bg-black-80 text-label-xs text-white">
                    Selected
                  </div>
                )}

                {isRemovable && (
                  <div
                    onClick={(e) => handleRemove(e, item)}
                    className="absolute top-[8px] right-[8px] w-[24px] h-[24px] rounded-full bg-black-80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M9 3L3 9M3 3L9 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
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
