"use client";
// ......MobileGarmentStep........//
// Mobile body for the "Top" step — unlike every other option-picker step,
// desktop's garment picker opens a dedicated front/back/fabric-closeup
// upload flow instead of a single-image file picker. This mirrors that:
// the upload card opens MobileGarmentUploadSheet (an iOS-style draggable
// bottom sheet) instead of a plain <input type="file">, and — matching
// desktop's GarmentOptionPicker exactly — tapping a blank front image or a
// blank back/close-up thumbnail on an already-uploaded card reopens that
// same sheet, pre-filled, so the user can fill in just the missing angle(s).
import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useOptionSelection } from "@/app/context/option-selection-context";
import SourceFilterDropdown, { SourceFilter } from "@/app/components/optionPicker/SourceFilterDropdown";
import MobileGarmentUploadSheet, { GarmentUploadResult } from "./MobileGarmentUploadSheet";
import PhotoGuideSheet from "./PhotoGuideSheet";
import { PHOTO_GUIDES } from "@/app/config/photoGuideConfig";
import type { GarmentItem, GarmentPickerConfig } from "@/app/components/optionPicker/GarmentOptionPicker";
import { useImageDragDrop } from "@/app/hooks/useImageDragDrop";

function primaryImage(item: GarmentItem): StaticImageData | string | undefined {
  return item.front ?? item.back ?? item.closeup;
}

// Only uploaded items (always string blob URLs, never a static import) are
// ever reopened for editing, so this coercion is safe in practice.
function toUploadResult(item: GarmentItem): GarmentUploadResult {
  return {
    front: typeof item.front === "string" ? item.front : undefined,
    back: typeof item.back === "string" ? item.back : undefined,
    closeup: typeof item.closeup === "string" ? item.closeup : undefined,
  };
}

// Small back/close-up thumbnails pinned bottom-left of each card, matching
// desktop's GarmentOptionPicker — blank placeholder when that angle wasn't
// provided. Tapping a blank one on a user-uploaded card reopens the upload
// sheet for that item; default catalog items have no `onClickMissing`, so
// their blanks (there are none in practice) stay inert.
function Thumb({
  image,
  alt,
  onClickMissing,
}: {
  image: StaticImageData | string | undefined;
  alt: string;
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
        className={`relative w-[56px] h-[67px] rounded-[8px] bg-surface-white border-[1.5px] border-[#FFFFFF] ${onClickMissing ? "cursor-pointer" : ""}`}
        style={{ boxShadow: "0 0 0 1.4px rgba(0, 0, 0, 0.08), 0 8px 8px -4px rgba(0, 0, 0, 0.07), 0 6px 6px -3px rgba(0, 0, 0, 0.07), 0 4px 4px -2px rgba(0, 0, 0, 0.04), 0 2px 2px -1px rgba(0, 0, 0, 0.04)" }}
      >
        {/* Desktop only reveals this "+" on hover — there's no hover on
            mobile, so it shows by default whenever tapping actually does
            something (i.e. this angle is fillable). */}
        {onClickMissing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-darker">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className="relative w-[56px] h-[67px] rounded-[8px] overflow-hidden border-[1.5px] border-[#FFFFFF] bg-surface-white"
      style={{ boxShadow: "0 0 0 1.4px rgba(0, 0, 0, 0.08), 0 8px 8px -4px rgba(0, 0, 0, 0.07), 0 6px 6px -3px rgba(0, 0, 0, 0.07), 0 4px 4px -2px rgba(0, 0, 0, 0.04), 0 2px 2px -1px rgba(0, 0, 0, 0.04)" }}
    >
      <Image src={image} alt={alt} fill unoptimized={typeof image === "string"} className="object-cover" />
    </div>
  );
}

function SelectedBadge() {
  return (
    <div className="absolute top-[12px] left-[12px] flex items-center justify-center gap-[4px] flex-row pl-[4px] pr-[8px] py-[4px] rounded-[6px] bg-surface-light">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3.33203 7.99935L6.66536 11.3327L13.332 4.66602" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
      <p className="text-label-xs text-[#FFFFFF]">Selected</p>
    </div>
  );
}

export default function MobileGarmentStep({
  config,
  items,
  onItemsChange,
}: {
  config: GarmentPickerConfig;
  // Lifted up to MobileGenerateFlow — see the same note in MobileOptionStep.
  items: GarmentItem[];
  onItemsChange: (items: GarmentItem[]) => void;
}) {
  const { selections, setSelection } = useOptionSelection();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  // Derived from the shared context every render (not copied into its own
  // state) — see the same note in MobileOptionStep for why.
  const selectedId = selections[config.key]?.id ?? null;
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showGuideSheet, setShowGuideSheet] = useState(false);
  const guideData = PHOTO_GUIDES[config.key];
  // Set when the sheet was reopened from a card missing an angle (instead of
  // the "Upload new {label}" card) — handleSaveGarment then updates this
  // item in place instead of creating a new one, matching desktop.
  const [editingItem, setEditingItem] = useState<GarmentItem | null>(null);
  // Same drop-to-prefill-front as desktop's GarmentOptionPicker, minus the
  // hover highlight — a hover-style highlight doesn't make sense on a touch screen.
  const [dropInitial, setDropInitial] = useState<GarmentUploadResult | null>(null);

  const visibleItems = items.filter((item) => {
    if (sourceFilter === "all") return true;
    const isUpload = item.id.startsWith("upload-");
    return sourceFilter === "uploads" ? isUpload : !isUpload;
  });

  function handleSelect(item: GarmentItem) {
    const image = primaryImage(item);
    if (!image) return;
    setSelection(config.key, { id: item.id, image });
  }

  function handleEditMissing(item: GarmentItem) {
    setEditingItem(item);
    setShowUploadSheet(true);
  }

  function handleRemove(e: React.MouseEvent, item: GarmentItem) {
    e.stopPropagation();
    onItemsChange(items.filter((i) => i.id !== item.id));
  }

  function closeUploadSheet() {
    setShowUploadSheet(false);
    setEditingItem(null);
    setDropInitial(null);
  }

  function handleDropFront(file: File) {
    setEditingItem(null);
    setDropInitial({ front: URL.createObjectURL(file) });
    setShowUploadSheet(true);
  }

  // Same as handleDropFront, for an image dragged in from a webpage instead
  // of a local file — see useImageDragDrop's onUrl for why there's no File here.
  function handleDropFrontUrl(url: string) {
    setEditingItem(null);
    setDropInitial({ front: url });
    setShowUploadSheet(true);
  }

  const dragDrop = useImageDragDrop(handleDropFront, handleDropFrontUrl);

  function handleSaveGarment(result: GarmentUploadResult) {
    if (editingItem) {
      const updated: GarmentItem = { ...editingItem, front: result.front, back: result.back, closeup: result.closeup };
      onItemsChange(items.map((i) => (i.id === editingItem.id ? updated : i)));
      if (selectedId === editingItem.id) {
        setSelection(config.key, { id: updated.id, image: primaryImage(updated)! });
      }
      closeUploadSheet();
      return;
    }

    const newItem: GarmentItem = { id: `upload-${Date.now()}`, front: result.front, back: result.back, closeup: result.closeup };
    onItemsChange([newItem, ...items]);
    closeUploadSheet();
    handleSelect(newItem);
  }

  return (
    <div className="flex flex-col gap-[32px] px-[16px] pt-[32px] pb-[32px]">
      <div className="flex flex-col gap-[20px]">
        <button
          onClick={() => setShowUploadSheet(true)}
          onDragOver={dragDrop.onDragOver}
          onDragLeave={dragDrop.onDragLeave}
          onDrop={dragDrop.onDrop}
          className="group w-full h-[140px] rounded-[16px] border  border-white/50 bg-white/8 active:bg-white-12 flex flex-col items-center justify-center gap-[8px] cursor-pointer"
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
          <p className="text-label-sm text-strong">Upload new {config.label}</p>
        </button>
        {guideData && (
          <p onClick={() => setShowGuideSheet(true)} className="text-label-xs text-sub text-center underline underline-offset-3 cursor-pointer">Photo guide</p>
        )}
      </div>


       <div className="flex flex-col gap-[24px]">
             <div className="flex flex-row items-center justify-between h-[32px] bg-surface-weak">
        <p className="text-label-sm text-white">All {config.description}</p>
        <SourceFilterDropdown value={sourceFilter} onChange={setSourceFilter} />
      </div>

      <div className="grid grid-cols-2 gap-[12px]">
        {visibleItems.map((item) => {
          const isUpload = item.id.startsWith("upload-");
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="group aspect-[5/6] rounded-[16px] flex items-center justify-center relative cursor-pointer overflow-hidden bg-surface-white"
            >
              {item.front ? (
                <Image src={item.front} alt={config.label} fill sizes="200px" unoptimized={typeof item.front === "string"} className="object-cover" />
              ) : (
                <div
                  onClick={
                    isUpload
                      ? (e) => {
                          e.stopPropagation();
                          handleEditMissing(item);
                        }
                      : undefined
                  }
                  className="absolute inset-0 bg-surface-white flex items-center justify-center"
                >
                  {/* Same plus as the back/closeup thumbs, bigger since this
                      fills the whole card — shown by default (no hover on
                      mobile), matching desktop's hover-revealed one. */}
                  {isUpload && (
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="text-darker">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              )}

              <div className="absolute bottom-[12px]  flex flex-row gap-[8px]">
                <Thumb image={item.back} alt={`${config.label} back`} onClickMissing={isUpload ? () => handleEditMissing(item) : undefined} />
                <Thumb image={item.closeup} alt={`${config.label} close-up`} onClickMissing={isUpload ? () => handleEditMissing(item) : undefined} />
              </div>

              {selectedId === item.id && <SelectedBadge />}

              {/* Always visible (no hover on touch), unlike desktop's
                  hover-reveal remove icon on the same card. */}
              {isUpload && (
                <div
                  onClick={(e) => handleRemove(e, item)}
                  className="absolute top-[12px] right-[12px] w-[24px] h-[24px] rounded-full bg-black-60 flex items-center justify-center cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
       </div>


      {showUploadSheet && (
        <MobileGarmentUploadSheet
          label={config.label}
          initial={editingItem ? toUploadResult(editingItem) : dropInitial ?? undefined}
          onClose={closeUploadSheet}
          onAdd={handleSaveGarment}
        />
      )}
      {guideData && <PhotoGuideSheet isOpen={showGuideSheet} onClose={() => setShowGuideSheet(false)} data={guideData} />}
    </div>
  );
}
