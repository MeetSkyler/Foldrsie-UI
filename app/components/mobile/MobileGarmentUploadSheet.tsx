"use client";
// ......MobileGarmentUploadSheet........//
// Mobile equivalent of desktop's UploadGarmentModal (front/back/fabric
// close-up upload) — same slot logic and discard-confirm behavior, but
// presented as an iOS-style bottom sheet: slides up from the bottom, has a
// drag handle, and can be dragged down (with elastic resistance) to dismiss
// instead of desktop's centered dialog.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useImageDragDrop } from "@/app/hooks/useImageDragDrop";

export type GarmentUploadResult = {
  front?: string;
  back?: string;
  closeup?: string;
};

type SlotKey = "front" | "back" | "closeup";

type SlotState = {
  previewUrl: string | null;
  uploading: boolean;
  progress: number;
};

const EMPTY_SLOT: SlotState = { previewUrl: null, uploading: false, progress: 0 };

const SLOT_META: Record<SlotKey, { title: string; optional?: boolean }> = {
  front: { title: "Front view" },
  back: { title: "Back view", optional: true },
  closeup: { title: "Fabric close-up", optional: true },
};

function MobileUploadSlot({
  slotKey,
  state,
  onFileSelected,
  onCancelUpload,
  onRemove,
}: {
  slotKey: SlotKey;
  state: SlotState;
  // Also accepts a plain URL string — dragging an image in from a webpage
  // gives us a URL, not a File (see useImageDragDrop's onUrl).
  onFileSelected: (fileOrUrl: File | string) => void;
  onCancelUpload: () => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const meta = SLOT_META[slotKey];
  // Same drag-to-drop as desktop's UploadGarmentModal, minus the hover
  // highlight — a hover-style highlight doesn't make sense on a touch screen.
  const dragDrop = useImageDragDrop(onFileSelected, onFileSelected);

  function handleClick() {
    inputRef.current?.click();
  }

  return (
    <div className="flex flex-col">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />

      {state.previewUrl && !state.uploading ? (
        <div className="relative w-full h-[140px] rounded-[16px]">
          <div className="absolute inset-0 rounded-[16px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.previewUrl} alt={meta.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>

          <div
            onClick={onRemove}
            className="absolute top-[8px] right-[8px] w-[24px] h-[24px] rounded-full bg-black-60 flex items-center justify-center cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div
            onClick={handleClick}
            className="absolute bottom-[8px] active:scale-[0.98] transition-all duration-200 ease-out left-1/2 flex items-center justify-center -translate-x-1/2 px-[10px] py-[6px] rounded-[8px] bg-surface-light text-label-sm text-strong cursor-pointer"
          >
            Re-upload
          </div>
        </div>
      ) : state.uploading ? (
        <div className="w-full relative h-[140px] rounded-[16px] bg-surface-alpha-light-weak">
         <div className=" w-full flex flex-col gap-[12px] h-full absolute bottom-[24px] items-center justify-end">
          <div className="w-full flex flex-col items-center justify-center gap-[16px]">
            <div className="w-[137px] h-[4px] rounded-[999px] bg-surface-mid overflow-hidden">
            <div className="h-full bg-[#D9D9D9] transition-[width] duration-150 ease-linear" style={{ width: `${state.progress}%` }} />
          </div>
          <p className="text-paragraph-xs text-strong">Uploading...{state.progress}%</p>
          </div>
          <p onClick={onCancelUpload} className="text-label-sm px-[10px] py-[6px] text-strong bg-surface-light rounded-[8px] cursor-pointer">
            Cancel
          </p>
         </div>
        </div>
      ) : (
        // .....btn inputs .......
        <button
          onClick={handleClick}
          onDragOver={dragDrop.onDragOver}
          onDragLeave={dragDrop.onDragLeave}
          onDrop={dragDrop.onDrop}
          className="group w-full h-[140px] rounded-[16px] bg-surface-alpha-light-weak active:bg-surface-alpha-light-white transition-colors flex flex-col items-center justify-center gap-[12px] cursor-pointer"
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
              <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z" fill="white" />
            </svg>
          </div>
          <p className="text-label-sm text-center">
            <span className="text-strong">{meta.title}</span>
            {meta.optional && <span className="text-sub">  (Optional)</span>}
          </p>
        </button>
      )}
    </div>
  );
}

function slotFromInitial(url: string | undefined): SlotState {
  return url ? { previewUrl: url, uploading: false, progress: 100 } : EMPTY_SLOT;
}

// Dragging the sheet down past this many px (or with enough velocity)
// dismisses it — matching the standard iOS sheet "flick to dismiss" feel.
const DRAG_DISMISS_DISTANCE = 120;
const DRAG_DISMISS_VELOCITY = 500;
// A tighter, less floaty spring than a default one — quick to settle with
// just a hint of overshoot, closer to iOS's own sheet-presentation feel
// than a long, bouncy spring would be.
const SHEET_SPRING = { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.9 };
// The open animation runs while the sheet's own content is still laying
// out for the first time — a JS-driven spring shares the main thread with
// that work and can visibly stutter. A plain tween with this iOS-style
// curve is WAAPI-compatible, so the browser can run it on the compositor
// thread regardless of what the main thread is doing.
const SHEET_ENTER = { type: "tween" as const, duration: 0.32, ease: [0.32, 0.72, 0, 1] as const };

export default function MobileGarmentUploadSheet({
  label,
  initial,
  onClose,
  onAdd,
}: {
  label: string;
  initial?: GarmentUploadResult;
  onClose: () => void;
  onAdd: (result: GarmentUploadResult) => void;
}) {
  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
    front: slotFromInitial(initial?.front),
    back: slotFromInitial(initial?.back),
    closeup: slotFromInitial(initial?.closeup),
  });
  // Snapshot of what the slots looked like when this sheet opened — reopening
  // for a missing angle pre-fills from `initial`, and closing without adding
  // anything new shouldn't prompt to discard something that was never
  // actually changed in this session. Captured once and never updated.
  const [initialSlots] = useState<Record<SlotKey, SlotState>>({
    front: slotFromInitial(initial?.front),
    back: slotFromInitial(initial?.back),
    closeup: slotFromInitial(initial?.closeup),
  });
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  // Plays the sheet's exit animation before actually unmounting — the
  // parent's own onClose (which removes this component from the tree) only
  // fires once AnimatePresence reports that animation finished.
  const [isClosing, setIsClosing] = useState(false);
  const timersRef = useRef<Record<SlotKey, ReturnType<typeof setInterval> | null>>({
    front: null,
    back: null,
    closeup: null,
  });

  useEffect(() => {
    return () => {
      (Object.keys(timersRef.current) as SlotKey[]).forEach((k) => {
        const t = timersRef.current[k];
        if (t) clearInterval(t);
      });
    };
  }, []);

  function startUpload(slotKey: SlotKey, fileOrUrl: File | string) {
    setSlots((prev) => ({ ...prev, [slotKey]: { previewUrl: null, uploading: true, progress: 0 } }));

    const duration = 300 + Math.random() * 200;
    const startedAt = Date.now();
    // A dragged-in webpage image is already a URL — no blob to create.
    const previewUrl = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);

    const timer = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - startedAt) / duration) * 100));
      if (pct >= 100) {
        clearInterval(timer);
        timersRef.current[slotKey] = null;
        setSlots((prev) => ({ ...prev, [slotKey]: { previewUrl, uploading: false, progress: 100 } }));
      } else {
        setSlots((prev) => ({ ...prev, [slotKey]: { ...prev[slotKey], progress: pct } }));
      }
    }, 100);

    timersRef.current[slotKey] = timer;
  }

  function cancelUpload(slotKey: SlotKey) {
    const t = timersRef.current[slotKey];
    if (t) {
      clearInterval(t);
      timersRef.current[slotKey] = null;
    }
    setSlots((prev) => ({ ...prev, [slotKey]: EMPTY_SLOT }));
  }

  function removeSlot(slotKey: SlotKey) {
    setSlots((prev) => ({ ...prev, [slotKey]: EMPTY_SLOT }));
  }

  const hasCompletedImage = (Object.keys(slots) as SlotKey[]).some((k) => slots[k].previewUrl);
  // Whether anything actually changed since the sheet opened — see the same
  // note on UploadGarmentModal.tsx's hasChanges for why this (not
  // hasCompletedImage) is what should gate the discard confirmation.
  const hasChanges = (Object.keys(slots) as SlotKey[]).some(
    (k) => slots[k].previewUrl !== initialSlots[k].previewUrl || slots[k].uploading
  );

  function requestClose() {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      setIsClosing(true);
    }
  }

  function handleAdd() {
    if (!hasCompletedImage) return;
    onAdd({
      front: slots.front.previewUrl ?? undefined,
      back: slots.back.previewUrl ?? undefined,
      closeup: slots.closeup.previewUrl ?? undefined,
    });
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DRAG_DISMISS_DISTANCE || info.velocity.y > DRAG_DISMISS_VELOCITY) {
      requestClose();
    }
  }

  return (
    <AnimatePresence onExitComplete={onClose}>
      {!isClosing && (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden">
      <motion.div
        onClick={requestClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute inset-0 bg-black-90"
      />

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        initial={{ y: "100%" }}
        animate={{ y: 0, transition: SHEET_ENTER }}
        exit={{ y: "100%", transition: SHEET_SPRING }}
        style={{ willChange: "transform" }}
        className="relative w-full h-[calc(100dvh-80px)] bg-surface-weak rounded-t-[24px] flex flex-col"
      >
      {/* Fixed header — drag handle + title never scroll away. */}
      <div className="shrink-0 flex flex-col gap-[5px] w-full pt-[6px] px-[16px]">
        <div className="w-full flex items-center justify-center py-[4px] cursor-grab active:cursor-grabbing">
          <div className="w-[36px] h-[5px] rounded-full bg-surface-light" />
        </div>

        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-[8px] pt-[11px]">
            <p className="text-label-md text-strong">Upload {label}</p>
            <p className="text-paragraph-sm text-sub">Front is required. Back and fabric closeup are optional but improve accuracy.</p>
          </div>
          <div onClick={requestClose} className="w-[32px] h-[32px] rounded-full bg-surface-soft flex items-center justify-center cursor-pointer shrink-0">
           <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
           <path d="M15 5L5 15M5 5L15 15" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
          </div>
        </div>
      </div>

      {/* Only this middle section scrolls — on a short screen the 3 cards
          scroll internally instead of pushing Cancel/Add below the fold. */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pt-[24px]">
        <div className="flex flex-col gap-[12px]">
          <MobileUploadSlot slotKey="front" state={slots.front} onFileSelected={(f) => startUpload("front", f)} onCancelUpload={() => cancelUpload("front")} onRemove={() => removeSlot("front")} />
          <MobileUploadSlot slotKey="back" state={slots.back} onFileSelected={(f) => startUpload("back", f)} onCancelUpload={() => cancelUpload("back")} onRemove={() => removeSlot("back")} />
          <MobileUploadSlot slotKey="closeup" state={slots.closeup} onFileSelected={(f) => startUpload("closeup", f)} onCancelUpload={() => cancelUpload("closeup")} onRemove={() => removeSlot("closeup")} />
        </div>
      </div>

      {/* Fixed footer — Cancel/Add stay reachable no matter how tall the
          cards above get. */}
      <div
        className="shrink-0 flex flex-row items-center gap-[12px] pt-[12px] px-[16px]"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <button onClick={requestClose} className="s-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer">
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={!hasCompletedImage}
          className="p-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer disabled:cursor-not-allowed capitalize"
        >
          Add {label}
        </button>
      </div>
      </motion.div>

      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black-90 px-[20px]">
          <div className="w-full bg-surface-weak rounded-[16px] p-[24px] flex flex-col border border-line-sub gap-[32px]">

            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-col gap-[8px]">
                <p className="text-label-lg text-strong">Discard uploaded images?</p>
                <p className="text-label-sm text-sub">Your selected images will be removed</p>
              </div>
              <div onClick={() => setShowDiscardConfirm(false)} className="w-[16px] h-[16px] flex items-center justify-center text-strong cursor-pointer shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-sub">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-full gap-[8px]">
              <button
                onClick={() => {
                  setShowDiscardConfirm(false);
                  setIsClosing(true);
                }}
                className="text-label-sm w-full px-[12px] py-[8px] bg-semantic-red-alpha-25 rounded-[8px] flex items-center justify-center active:scale-[0.98] text-semantic-red-200 cursor-pointer"
              >
                Discard
              </button>
              <button onClick={() => setShowDiscardConfirm(false)} className="p-btn-noicon-36 w-full active:scale-[0.98] text-label-sm cursor-pointer">
                Keep editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      )}
    </AnimatePresence>
  );
}
