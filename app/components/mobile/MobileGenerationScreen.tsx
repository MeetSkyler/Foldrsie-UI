"use client";
// ......MobileGenerationScreen........//
// Full-screen "Image generation" view shown on mobile while a generation is
// loading, and once it's done — the mobile counterpart of desktop's own
// loading/done card in app/generate/page.tsx, which is where all the state
// (phase/viewing/generations) actually lives; this component is purely
// presentational. Closing it (the X, or "Back" once done) just hides this
// screen for the current visit — the generation itself keeps running in the
// background regardless, tracked by the shared context.
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Spinner from "@/app/components/Spinner";
import type { GenerationItem } from "@/app/context/generations-context";

const THUMB_HEIGHT = 80;
const STRIP_GAP = 32; // matches the wrapper's gap-[32px] between image and strip
// Mirrors desktop's fitBox (app/generate/page.tsx) — height stays fixed at
// this value for every ratio, so switching between generations of
// different shapes never changes the card's height, only its width.
const CARD_HEIGHT = 450;

function thumbBox(ratio: number) {
  return { width: THUMB_HEIGHT * ratio, height: THUMB_HEIGHT };
}

// Every non-landscape ratio (ratio <= 1) shares the exact same height —
// `targetHeight`, already clamped by the caller to whatever both the
// available width and available height actually allow — so a card's width
// (`targetHeight * ratio`) is automatically within the available width too
// (since ratio <= 1 means width <= targetHeight). That's what keeps Tall,
// Square, Standard, Vertical and Portrait all visually the same height,
// each only differing in width. Landscape (ratio > 1) is the one
// exception: it fills the available width instead and lets its (shorter)
// height simply follow from that via `aspect-ratio`.
function cardStyle(ratio: number, targetHeight: number): CSSProperties {
  if (ratio > 1) {
    return { width: "100%", aspectRatio: ratio };
  }
  return { height: targetHeight, width: targetHeight * ratio };
}

export default function MobileGenerationScreen({
  phase,
  viewing,
  generations,
  ratio,
  onSelectViewing,
  onClose,
}: {
  phase: "loading" | "done";
  viewing: GenerationItem | undefined;
  generations: GenerationItem[];
  ratio: number;
  onSelectViewing: (id: string) => void;
  onClose: () => void;
}) {
  const total = generations.length;
  const showStrip = total >= 2;
  const showOverflow = total > 3;
  // When overflowing, the "View all" tile takes one of the 3 slots itself
  // (rendered separately below, using the latest item's image) — so only 2
  // real thumbnails are sliced here, keeping the strip at exactly 3 cards
  // total instead of 3 thumbnails plus a 4th overflow tile.
  const stripItems = showOverflow ? generations.slice(-3, -1) : generations.slice(-3);
  const latest = generations[total - 1];

  // Measures the CenterImgBar's own real size (i.e. whatever's actually
  // left over between the top bar and bottom bar, and between the left/
  // right padding) so cardStyle can clamp the shared target height to it
  // directly, instead of assuming fixed pixel budgets that would drift if
  // either bar's own content ever changed size.
  const centerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = centerRef.current;
    if (!el) return;
    function measure() {
      const rect = el!.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The container's own padding (px-[16px] each side, pb-[24px], no top
  // padding) isn't available to children, and when the strip is showing it
  // claims its own slice (gap-[32px] + THUMB_HEIGHT) out of the same
  // vertical space — whatever's left after that is the true budget the
  // image itself has to fit in, on both axes.
  const availableWidth = containerSize.width > 0 ? containerSize.width - 32 : 0;
  const availableHeight = containerSize.height > 0 ? containerSize.height - 24 : 0;
  const imageMaxHeight = availableHeight > 0 && phase === "done" && showStrip ? availableHeight - (STRIP_GAP + THUMB_HEIGHT) : availableHeight;
  // Falls back to the plain CARD_HEIGHT cap alone until the first measure
  // completes (a one-frame guess, corrected immediately after mount).
  const targetHeight = Math.min(CARD_HEIGHT, availableWidth || CARD_HEIGHT, imageMaxHeight || CARD_HEIGHT);

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:hidden bg-surface-dark px-[16px]">

      {/* .....TopBar....... */}
      <div className="w-full shrink-0 flex flex-row items-center justify-between  pt-[12px] pb-[32px]">
        <p className="text-label-lg text-strong">Image generation</p>
        <div onClick={onClose} className="w-[32px] h-[32px] rounded-full bg-surface-soft flex items-center justify-center cursor-pointer shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>



      {/* .....CenterImgBar......... */}
    

      <div ref={centerRef} className="flex-1 min-h-0 overflow-y-auto  no-scrollbar w-full px-[16px] pb-[24px] flex flex-col items-center justify-center gap-[32px]">
        {phase === "loading" && (
          <div
            className="relative shrink-0 rounded-[24px] overflow-hidden flex items-center justify-center bg-surface-soft"
            style={cardStyle(ratio, targetHeight)}
          >
            <video src="/Generating.webm" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
            <p className="relative text-paragraph-sm text-strong flex items-center">
              Generating
              <span className="loading-dot" style={{ animationDelay: "0s" }}>.</span>
              <span className="loading-dot" style={{ animationDelay: "0.2s" }}>.</span>
              <span className="loading-dot" style={{ animationDelay: "0.4s" }}>.</span>
            </p>
          </div>
        )}

        {phase === "done" && viewing && (
          // Wrapping the image + strip together (instead of leaving them as
          // separate top-level flex children) keeps both reliably centered
          // as one block now that the image's own width varies with its
          // ratio instead of always being full-width — matching desktop's
          // centered layout.
          <div className="w-full flex flex-col items-center gap-[32px]">
            <div className="relative shrink-0 rounded-[16px] overflow-hidden bg-pure-dark border border-line-sub" style={cardStyle(viewing.ratio, targetHeight)}>
              <Image src={viewing.image} alt="Generated result" fill unoptimized className="object-cover" />
            </div>

            {showStrip && (
              <div className="w-full shrink-0 flex flex-row gap-[12px] px-[4px] py-[4px] items-center justify-center overflow-x-auto no-scrollbar">
                {stripItems.map((g) => {
                  const itemThumb = thumbBox(g.ratio);
                  return (
                    <button
                      key={g.id}
                      onClick={() => onSelectViewing(g.id)}
                      style={{ width: itemThumb.width, height: itemThumb.height }}
                      className={`relative shrink-0 rounded-[12px] cursor-pointer overflow-hidden ${
                        g.id === viewing.id ? "shadow-[0_0_0_2px_#FFF] border-[2px] border-[#000000] " : ""
                      }`}
                    >
                      {/* The selected ring is a shadow/border on this button
                          itself — putting `overflow-hidden` on the SAME
                          element (needed to round off the image) clips that
                          shadow right along with it, which is why it was
                          showing up cut off. Rounding the image via this
                          separate inner wrapper instead leaves the outer
                          button's shadow free to render in full. */}
                      <div className="absolute inset-0  overflow-hidden bg-surface-soft overflow-hidden">
                        <Image src={g.image} alt="" fill unoptimized className="object-cover" />
                      </div>
                    </button>
                  );
                })}

                {showOverflow && latest && (() => {
                  const overflowThumb = thumbBox(latest.ratio);
                  return (
                    <Link
                      href="/gallery"
                      style={{ width: overflowThumb.width, height: overflowThumb.height }}
                      className="relative shrink-0 rounded-[12px] overflow-hidden flex items-center justify-center cursor-pointer"
                    >
                      <Image src={latest.image} alt="" fill unoptimized className="object-cover" />
                      <span className="relative tracking-[-0.5%] text-strong z-20 text-[0.7em]">View all</span>
                      <div className="absolute bg-black-80 pointer-events-none inset-0" />
                    </Link>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>




     {/* .........BottomBar.......... */}
      <div className="shrink-0  pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))] flex flex-row gap-[10px] bg-surface-dark">
        {phase === "loading" ? (
          <button disabled className="p-btn-noicon-48 flex-1 flex flex-row items-center justify-center gap-[4px] text-label-sm cursor-not-allowed">
            <Spinner size={16} />
            <span>
              Generating
              <span className="loading-dot" style={{ animationDelay: "0s" }}>.</span>
              <span className="loading-dot" style={{ animationDelay: "0.2s" }}>.</span>
              <span className="loading-dot" style={{ animationDelay: "0.4s" }}>.</span>
            </span>
          </button>
        ) : (
          <>
            <button onClick={onClose} className="s-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer">
              Back
            </button>
            <button className="p-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer">
              Download
            </button>
          </>
        )}
      </div>
    </div>
  );
}
