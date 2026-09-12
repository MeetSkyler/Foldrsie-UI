"use client";
// ......PhotoGuideSheet........//
// Mobile counterpart of PhotoGuideModal.tsx — same shared data (title/
// subtitle/doItems/avoidItems from app/config/photoGuideConfig.ts), same
// idea, presented as an iOS-style bottom sheet (drag handle, slides up from
// the bottom, drag-down to dismiss) instead of desktop's centered dialog —
// same pattern as MobileGarmentUploadSheet.tsx / MobileColorPickerSheet.tsx.
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import type { PhotoGuideData } from "@/app/config/photoGuideConfig";

const DRAG_DISMISS_DISTANCE = 120;
const DRAG_DISMISS_VELOCITY = 500;
// A tighter, less floaty spring than a default one — quick to settle with
// just a hint of overshoot, closer to iOS's own sheet-presentation feel
// than a long, bouncy spring would be. Used for the exit (close) animation,
// where nothing new needs to paint — it's already smooth.
const SHEET_SPRING = { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.9 };
// The open animation runs while the sheet's own content (images etc.) is
// still decoding/laying out for the first time — a JS-driven spring shares
// the main thread with that work and can visibly stutter. A plain tween
// with this iOS-style curve is WAAPI-compatible, so the browser can run it
// on the compositor thread regardless of what the main thread is doing.
const SHEET_ENTER = { type: "tween" as const, duration: 0.32, ease: [0.32, 0.72, 0, 1] as const };

function ExampleGrid({ items }: { items: PhotoGuideData["doItems"] }) {
  return (
    <div className="w-full grid grid-cols-2 gap-[12px]">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-[8px]">
          <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-surface-soft">
            <Image src={item.image} alt={item.caption} fill unoptimized className="object-cover" />
          </div>
          <p className="text-paragraph-sm text-sub text-center">{item.caption}</p>
        </div>
      ))}
    </div>
  );
}

export default function PhotoGuideSheet({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: PhotoGuideData;
}) {
  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DRAG_DISMISS_DISTANCE || info.velocity.y > DRAG_DISMISS_VELOCITY) {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden">
      <motion.div
        onClick={onClose}
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
              <p className="text-label-md text-strong">{data.title}</p>
              <p className="text-paragraph-sm text-sub">{data.subtitle}</p>
            </div>
            <div onClick={onClose} className="w-[32px] h-[32px] rounded-full bg-surface-soft flex items-center justify-center cursor-pointer shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Only this middle section scrolls — the header stays put and a
            long list of examples scrolls internally. */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pt-[24px] pb-[24px]">
          <div className="flex flex-col gap-[40px]">
            <div className="flex flex-col gap-[16px]">
              <div className="flex flex-row items-center gap-[8px]">
                <div className="w-[20px] h-[20px] rounded-full bg-semantic-green-alpha-25 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.33333L5.66667 10L11 4" stroke="#4ADE80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-label-md text-strong">Use photos like these</p>
              </div>
              <ExampleGrid items={data.doItems} />
            </div>

            <div className="flex flex-col gap-[16px]">
              <div className="flex flex-row items-center gap-[8px]">
                <div className="w-[20px] h-[20px] rounded-full bg-semantic-red-alpha-25 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#FDB5B4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-label-md text-strong">Avoid photos like these</p>
              </div>
              <ExampleGrid items={data.avoidItems} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  )
}
