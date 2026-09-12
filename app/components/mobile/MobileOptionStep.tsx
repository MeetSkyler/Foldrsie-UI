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
import { useImageDragDrop } from "@/app/hooks/useImageDragDrop";

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
  // Set when the color sheet was reopened to edit an existing swatch (via its
  // always-visible pencil icon — no hover on touch) instead of opened fresh
  // from "Create color" — tells handleAddColor to update that item in place.
  const [editingColorItem, setEditingColorItem] = useState<OptionPickerItem | null>(null);
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
    if (editingColorItem) {
      const updated: OptionPickerItem = { ...editingColorItem, color: hex };
      onItemsChange(items.map((i) => (i.id === editingColorItem.id ? updated : i)));
      if (selectedId === editingColorItem.id) handleSelect(updated);
      setShowColorModal(false);
      setEditingColorItem(null);
      return;
    }
    const newItem: OptionPickerItem = { id: `color-${Date.now()}`, color: hex };
    onItemsChange([newItem, ...items]);
    setShowColorModal(false);
    handleSelect(newItem);
  }

  function handleEditColor(item: OptionPickerItem) {
    setEditingColorItem(item);
    setShowColorModal(true);
  }

  function closeColorModal() {
    setShowColorModal(false);
    setEditingColorItem(null);
  }

  function handleRemove(e: React.MouseEvent, item: OptionPickerItem) {
    e.stopPropagation();
    onItemsChange(items.filter((i) => i.id !== item.id));
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function addImageFile(file: File) {
    const newItem: OptionPickerItem = {
      id: `upload-${Date.now()}`,
      label: file.name,
      image: URL.createObjectURL(file),
    };
    onItemsChange([newItem, ...items]);
    handleSelect(newItem);
  }

  // Same as addImageFile, for an image dragged in from a webpage instead of
  // a local file — see useImageDragDrop's onUrl for why there's no File here.
  function addImageUrl(url: string) {
    const newItem: OptionPickerItem = { id: `upload-${Date.now()}`, label: url, image: url };
    onItemsChange([newItem, ...items]);
    handleSelect(newItem);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    addImageFile(file);
    e.target.value = "";
  }

  // Same drag-to-upload as desktop's OptionPicker — works fine on a laptop
  // trackpad-in-mobile-viewport case even though real touch devices don't
  // fire these events; either way there's no hover highlight here (`.
  // isDragging` is intentionally unused below), since a hover-style
  // highlight doesn't make sense on a touch screen.
  const dragDrop = useImageDragDrop(addImageFile, addImageUrl);

  return (
    <div className="flex flex-col gap-[32px] px-[16px] py-[32px]">
      {config.uploadEnabled && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <div className="flex flex-col gap-[20px]">
            <button
              onClick={handleUploadClick}
              onDragOver={dragDrop.onDragOver}
              onDragLeave={dragDrop.onDragLeave}
              onDrop={dragDrop.onDrop}
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

          {visibleItems.map((item) => {
            const isRemovable = item.id.startsWith("upload-") || item.id.startsWith("color-");
            return (
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
                {/* Always visible (no hover on touch), unlike desktop's
                    hover-reveal versions of these same icons. */}
                {isRemovable && (
                  <div className="absolute top-[12px] right-[12px] flex flex-row items-center gap-[8px]">
                    {item.color && (
                      <div
                        onClick={(e) => { e.stopPropagation(); handleEditColor(item); }}
                        className="w-[24px] h-[24px] rounded-full bg-black-60 flex items-center justify-center cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M11.333 2.00016C11.5081 1.82506 11.7157 1.68605 11.9441 1.59109C12.1724 1.49614 12.4171 1.44708 12.6642 1.44669C12.9113 1.4463 13.1562 1.49459 13.3848 1.58882C13.6135 1.68305 13.8214 1.82141 13.9971 1.99598C14.1728 2.17055 14.3128 2.37792 14.4092 2.60629C14.5056 2.83465 14.5556 3.07954 14.556 3.32696C14.5564 3.57438 14.5083 3.81942 14.4127 4.04808C14.317 4.27673 14.1776 4.48453 14.0025 4.65961L4.99992 13.6622L1.33325 14.6668L2.33792 11.0001L11.333 2.00016Z" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <div
                      onClick={(e) => handleRemove(e, item)}
                      className="w-[24px] h-[24px] rounded-full bg-black-60 flex items-center justify-center cursor-pointer"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showColorModal && <MobileColorPickerSheet onClose={closeColorModal} onAdd={handleAddColor} initial={editingColorItem?.color} />}
      {guideData && <PhotoGuideSheet isOpen={showGuideSheet} onClose={() => setShowGuideSheet(false)} data={guideData} />}
    </div>
  );
}
