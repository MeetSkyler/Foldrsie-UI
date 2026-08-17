"use client";
import { useEffect, useRef, useState } from "react";

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

const SLOT_META: Record<SlotKey, { title: string }> = {
  front: { title: "Front view" },
  back: { title: "Back view  (Optional)" },
  closeup: { title: "Fabric close-up  (Optional)" },
};

function UploadSlot({
  slotKey,
  state,
  onFileSelected,
  onCancelUpload,
  onRemove,
}: {
  slotKey: SlotKey;
  state: SlotState;
  onFileSelected: (file: File) => void;
  onCancelUpload: () => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const meta = SLOT_META[slotKey];

  function handleClick() {
    inputRef.current?.click();
  }

  return (
    <div className="flex flex-col  bg-amber-400">
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
        <div className="relative w-full h-[350px] rounded-[16px] overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.previewUrl} alt={meta.title} className="w-full h-full object-cover" />

          <div
            onClick={onRemove}
            className="absolute top-[12px] right-[12px] w-[24px] h-[24px] rounded-full  bg-surface-light flex items-center justify-center cursor-pointer"
          >
           <svg  width="16" height="16" viewBox="0 0 16 16" fill="none">
             <path d="M12 4L4 12M4 4L12 12" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div
            onClick={handleClick}
            className="absolute bottom-[16px] left-1/2 flex items-center justify-center -translate-x-1/2 px-[10px] py-[6px] rounded-[8px] bg-surface-light text-label-sm text-strong cursor-pointer"
          >
            Re-upload
          </div>
        </div>
      ) : state.uploading ? (
        <div className="w-full relative h-[350px] rounded-[16px] bg-surface-alpha-light-weak flex flex-col items-center justify-center gap-[16px] px-[24px]">
          <div className="w-full h-[4px] rounded-[999px] bg-surface-mid overflow-hidden">
            <div
              className="h-full bg-[#D9D9D9] transition-[width] duration-150 ease-linear"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="text-paragraph-xs text-strong">Uploading...{state.progress}%</p>
          <p onClick={onCancelUpload} className="text-label-sm absolute bottom-[29px] px-[10px] py-[6px] text-strong bg-surface-light rounded-[8px] cursor-pointer">
            Cancel
          </p>
        </div>
      ) : (
     <>
        <button
          onClick={handleClick}
          className="w-full h-[350px] rounded-[16px] bg-surface-alpha-light-weak hover:bg-surface-alpha-light-white transition-colors flex flex-col items-center justify-center gap-[12px] cursor-pointer"
        >
          <div  className="w-[32px] h-[32px] rounded-full flex p-[6px] items-center justify-center text-strong text-[20px] leading-none"
                  style={{ boxShadow:
    "0 0 0.5px 0.5px var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 8px 8px -4px rgba(0, 0, 0, 0.05), " +
    "0 4px 4px -2px rgba(0, 0, 0, 0.05), " +
    "0 2px 2px -1px rgba(0, 0, 0, 0.05), " +
    "0 0 12px 0 var(--color-white-20, rgba(235, 237, 240, 0.20)) inset, " +
    "0 0 4px 0 var(--color-white-60, rgba(235, 237, 240, 0.60)) inset"
,
                    background:"var(--color-neutral-500),rgba(235, 237, 240, 0.08)"
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
                <p className="text-label-sm text-strong text-center">{meta.title}</p>
        </button>
   
    
     
     </>
        
      )}

     
    </div>
  );
}

export default function UploadGarmentModal({
  label,
  onClose,
  onAdd,
}: {
  label: string;
  onClose: () => void;
  onAdd: (result: GarmentUploadResult) => void;
}) {
  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
    front: EMPTY_SLOT,
    back: EMPTY_SLOT,
    closeup: EMPTY_SLOT,
  });
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
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

  function startUpload(slotKey: SlotKey, file: File) {
    setSlots((prev) => ({ ...prev, [slotKey]: { previewUrl: null, uploading: true, progress: 0 } }));

    // Time-based rather than fixed-increment-per-tick: progress is derived
    // from real elapsed time, so a delayed/throttled tick (e.g. a
    // backgrounded tab) can't leave the bar stuck part-way — the next tick
    // that does fire always catches up to where it should actually be.
    const duration = 1200 + Math.random() * 600;
    const startedAt = Date.now();

    const timer = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - startedAt) / duration) * 100));
      if (pct >= 100) {
        clearInterval(timer);
        timersRef.current[slotKey] = null;
        setSlots((prev) => ({ ...prev, [slotKey]: { previewUrl: URL.createObjectURL(file), uploading: false, progress: 100 } }));
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

  const hasAnyImage = (Object.keys(slots) as SlotKey[]).some(
    (k) => slots[k].previewUrl || slots[k].uploading
  );
  // Only a finished upload counts toward "at least one photo provided" —
  // an in-progress upload shouldn't let the user submit an empty slot.
  const hasCompletedImage = (Object.keys(slots) as SlotKey[]).some((k) => slots[k].previewUrl);

  function requestClose() {
    if (hasAnyImage) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-90">
      <div className="bg-surface-weak w-[780px] rounded-[24px] p-[24px] flex flex-col gap-[24px]">
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-[8px]">
            <p className="text-label-lg text-strong ">Upload {label}</p>
            <p className="text-label-sm text-sub">
              Front is required. Back and fabric closeup are optional but improve accuracy.
            </p>
          </div>
          <div
            onClick={requestClose}
            className="w-[24px] h-[24px]  flex items-center justify-center text-strong cursor-pointer shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-sub">
             <path d="M8.59961 0.600006L0.599609 8.60001M0.599609 0.600006L8.59961 8.60001" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[16px]">
          <UploadSlot
            slotKey="front"
            state={slots.front}
            onFileSelected={(f) => startUpload("front", f)}
            onCancelUpload={() => cancelUpload("front")}
            onRemove={() => removeSlot("front")}
          />
          <UploadSlot
            slotKey="back"
            state={slots.back}
            onFileSelected={(f) => startUpload("back", f)}
            onCancelUpload={() => cancelUpload("back")}
            onRemove={() => removeSlot("back")}
          />
          <UploadSlot
            slotKey="closeup"
            state={slots.closeup}
            onFileSelected={(f) => startUpload("closeup", f)}
            onCancelUpload={() => cancelUpload("closeup")}
            onRemove={() => removeSlot("closeup")}
          />
        </div>

        <div className="flex flex-row items-center justify-end gap-[12px]">
          <button
            onClick={requestClose}
            className="px-[12px] py-[8px] rounded-[8px] bg-surface-light text-label-sm text-strong cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!hasCompletedImage}
            className="px-[12px] py-[8px] rounded-[8px] bg-white text-label-sm text-darker cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed capitalize"
          >
            Add {label}
          </button>
        </div>
      </div>

      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black-80">
          <div className="bg-surface-weak w-[420px] rounded-[24px] p-[24px] flex flex-col gap-[20px]">
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-col gap-[4px]">
                <p className="text-title-h6 text-strong">Discard uploaded images?</p>
                <p className="text-paragraph-sm text-sub">Your selected images will be removed</p>
              </div>
              <div
                onClick={() => setShowDiscardConfirm(false)}
                className="w-[32px] h-[32px] rounded-full bg-surface-light flex items-center justify-center text-strong cursor-pointer shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="flex flex-row items-center justify-end gap-[12px]">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-[16px] py-[10px] rounded-[10px] bg-surface-light text-label-sm text-strong cursor-pointer"
              >
                Keep editing
              </button>
              <button
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="px-[16px] py-[10px] rounded-[10px] bg-white text-label-sm text-darker cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
