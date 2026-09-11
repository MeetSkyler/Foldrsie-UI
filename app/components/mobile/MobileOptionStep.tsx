"use client";
// ......MobileOptionStep........//
// Mobile body for one option-picker step (Face / Body type / Bottom /
// Footwear / Pose / Background) — reuses the exact same config shape,
// selection context, and "✓ Selected" badge markup as the desktop
// OptionPicker, just laid out for a single 2-column mobile screen instead
// of desktop's variable-column zoomable grid. Upload/color-picker is its
// own full-width card above the grid (mobile-only treatment); an
// `autoOption` (Body type's "Auto") stays a normal grid cell, matching
// desktop.
import { useRef, useState } from "react";
import Image from "next/image";
import { useOptionSelection } from "@/app/context/option-selection-context";
import type { OptionPickerConfig, OptionPickerItem } from "@/app/components/optionPicker/OptionPicker";
import SourceFilterDropdown, { SourceFilter } from "@/app/components/optionPicker/SourceFilterDropdown";
import MobileColorPickerSheet from "./MobileColorPickerSheet";
import PhotoGuideSheet from "./PhotoGuideSheet";
import { PHOTO_GUIDES } from "@/app/config/photoGuideConfig";

const AUTO_ID = "auto";

function SelectedBadge() {
  return (
    <div className="absolute top-[12px] left-[12px] flex items-center justify-center gap-[4px] flex-row pl-[4px] pr-[8px] py-[4px] rounded-[6px] bg-surface-light">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3.33203 7.99935L6.66536 11.3327L13.332 4.66602" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-label-xs text-[#FFFFFF]">Selected</p>
    </div>
  );
}

export default function MobileOptionStep({
  config,
  items,
  onItemsChange,
}: {
  config: OptionPickerConfig;
  // Lifted up to MobileGenerateFlow — this step remounts every time the user
  // navigates away and back (only one step renders at a time), so keeping
  // uploaded/custom-color items in local state here made them vanish on
  // Back/Next. The parent keeps them alive for the life of the whole flow.
  items: OptionPickerItem[];
  onItemsChange: (items: OptionPickerItem[]) => void;
}) {
  const { selections, setSelection } = useOptionSelection();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  // Derived straight from the shared context on every render — not copied
  // into its own local state — so there's no way for it to ever go stale or
  // briefly disagree with what's actually selected. `selections[config.key]`
  // is `null` specifically when "Auto" was chosen (see handleSelectAuto),
  // which is a real, deliberate selection, not "none yet"; checking `in`
  // first (does this key exist at all) is what tells "Auto was picked"
  // apart from "nothing was picked" — both would otherwise read as `null`.
  const selectedId: string | null = !(config.key in selections)
    ? null
    : selections[config.key] === null
      ? AUTO_ID
      : selections[config.key]!.id;
  const [showColorModal, setShowColorModal] = useState(false);
  const [showGuideSheet, setShowGuideSheet] = useState(false);
  const guideData = PHOTO_GUIDES[config.key];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const visibleItems = items.filter((item) => {
    if (sourceFilter === "all") return true;
    const isUserAdded = item.id.startsWith("upload-") || item.id.startsWith("color-");
    return sourceFilter === "uploads" ? isUserAdded : !isUserAdded;
  });

  function handleSelect(item: OptionPickerItem) {
    setSelection(config.key, item.color ? { id: item.id, color: item.color } : { id: item.id, image: item.image });
  }

  function handleSelectAuto() {
    setSelection(config.key, null);
  }

  function handleAddColor(hex: string) {
    const newItem: OptionPickerItem = { id: `color-${Date.now()}`, color: hex };
    onItemsChange([newItem, ...items]);
    setShowColorModal(false);
    handleSelect(newItem);
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
    onItemsChange([newItem, ...items]);
    handleSelect(newItem);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-[32px] px-[16px] py-[32px]">
      {config.uploadEnabled && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <div className="flex flex-col gap-[20px]">
            <button
              onClick={handleUploadClick}
              className="group w-full h-[140px] rounded-[16px] border border-white/50 bg-white/8 active:bg-white-12 flex flex-col items-center justify-center gap-[8px] cursor-pointer"
              style={{ boxShadow: "0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset" }}
            >
              <div
                className="w-[32px] h-[32px] group-active:scale-[0.95] group-active:translate-y-px transition-all duration-200 ease-out rounded-full flex p-[6px] items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
                style={{
                  boxShadow:
                    "0 0 0.5px 0.5px var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
                    "0 8px 8px -4px rgba(0, 0, 0, 0.05), 0 4px 4px -2px rgba(0, 0, 0, 0.05), 0 2px 2px -1px rgba(0, 0, 0, 0.05), " +
                    "0 0 12px 0 var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, 0 0 4px 0 var(--color-white-60, rgba(235, 237, 240, 0.60)) inset",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white"/>
                </svg>
              </div>
              <p className="text-label-sm text-strong">{config.uploadLabel ?? `Upload new ${config.label}`}</p>
            </button>
            {config.uploadNote ? (
              <p className="text-paragraph-xs text-sub text-center whitespace-pre-line">{config.uploadNote}</p>
            ) : guideData ? (
              <p onClick={() => setShowGuideSheet(true)} className="text-label-xs text-sub text-center underline underline-offset-3 cursor-pointer">Photo guide</p>
            ) : null}
          </div>
        </>
      )}

      <div className="flex flex-col gap-[24px]">
        <div className="flex flex-row items-center justify-between h-[32px] ">
          <p className="text-label-sm text-strong">All {config.description}</p>
          <SourceFilterDropdown value={sourceFilter} onChange={setSourceFilter} />
        </div>

        <div className="grid grid-cols-2 gap-[12px]">
          {config.colorPickerEnabled && (
            <button
              onClick={() => setShowColorModal(true)}
              className="group aspect-73/88 relative rounded-[16px] border border-white/50 bg-white/8 active:bg-white-12 flex flex-col items-center justify-center cursor-pointer"
              style={{ boxShadow: "0 0 24px 0 rgba(255, 255, 255, 0.24) inset, 0 0 4px 0 rgba(255, 255, 255, 0.40) inset" }}
            >
              <div className="flex flex-col group-active:scale-[0.95] group-active:translate-y-px transition-all duration-200 ease-out items-center justify-center gap-[8px] px-[12px]">
                <div
                  className="w-[32px] h-[32px] rounded-full flex p-[6px] items-center bg-surface-alpha-light-white justify-center text-strong leading-none"
                  style={{
                    boxShadow:
                      "0 0 0.5px 0.5px var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
                      "0 8px 8px -4px rgba(0, 0, 0, 0.05), 0 4px 4px -2px rgba(0, 0, 0, 0.05), 0 2px 2px -1px rgba(0, 0, 0, 0.05), " +
                      "0 0 12px 0 var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, 0 0 4px 0 var(--color-white-60, rgba(235, 237, 240, 0.60)) inset",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white"/>
                  </svg>
                </div>
                <p className="text-label-sm text-strong text-center">Create color</p>
              </div>
            </button>
          )}

          {config.autoOption && (
            <button
              onClick={handleSelectAuto}
              className={`aspect-73/88 relative border-[2px] rounded-[16px] flex flex-col items-center justify-center cursor-pointer ${
                selectedId === AUTO_ID ? "bg-surface-alpha-light-soft border-line-strong" : "border-line-sub"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-[8px] px-[12px]">
                <p className="text-label-sm text-strong text-center">{config.autoOption.title}</p>
                <p className="text-paragraph-sm text-sub text-center">{config.autoOption.subtitle}</p>
              </div>
              {selectedId === AUTO_ID && <SelectedBadge />}
            </button>
          )}

          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="group aspect-73/88 rounded-[16px] relative cursor-pointer overflow-hidden"
            >
              {item.color ? (
                <div className="absolute inset-0" style={{ background: item.color }} />
              ) : (
                <Image src={item.image!} alt={item.label ?? config.label} fill sizes="200px" unoptimized={typeof item.image === "string"} className="object-cover" />
              )}
              {selectedId === item.id && <SelectedBadge />}
            </button>
          ))}
        </div>
      </div>

      {showColorModal && <MobileColorPickerSheet onClose={() => setShowColorModal(false)} onAdd={handleAddColor} />}
      {guideData && <PhotoGuideSheet isOpen={showGuideSheet} onClose={() => setShowGuideSheet(false)} data={guideData} />}
    </div>
  );
}
