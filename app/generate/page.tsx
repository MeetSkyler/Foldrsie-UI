"use client";
import { Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from "motion/react";
import modalimg from '@/public/modalimg.svg'
import dummyResult from '@/public/img4.jpg'
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOptionSelection } from '@/app/context/option-selection-context';
import { useGenerations, GenerationItem } from '@/app/context/generations-context';

const CARD_MAX_H_LARGE = 540; // >= 1441px screens
const CARD_MAX_H_SMALL = 460; // <= 1440px screens
const LARGE_SCREEN_QUERY = "(min-width: 1441px)";
const THUMB_HEIGHT = 80;

// Height always stays fixed at the current breakpoint's target (460 or
// 540) for every aspect ratio — width is the only dimension that varies,
// derived straight from the ratio. No width cap: a cap would silently
// shrink height back down for wide (landscape) ratios, which is exactly
// the bug this replaced (only portrait-ish ratios were reaching the full
// target height; landscape/square ratios were getting clipped shorter).
function fitBox(ratio: number, targetH: number) {
  return { width: targetH * ratio, height: targetH };
}

// Thumbnails are a fixed height with width following each generation's own
// ratio — never a shared box, since every generation can have a different
// aspect ratio from the current selection.
function thumbBox(ratio: number) {
  return { width: THUMB_HEIGHT * ratio, height: THUMB_HEIGHT };
}

// The fullscreen view must show the same cropped composition as the small
// card (object-cover into a box shaped like the *selected* ratio) — not the
// dummy stand-in photo's own raw, uncropped proportions. This build reuses
// one static portrait photo for every selected ratio, so showing it
// object-contain at its real (uncropped) size made fullscreen display
// completely different content than what was just previewed (the whole
// portrait photo instead of the zoomed-in landscape crop shown on the
// card). Sizing the box from the ratio and covering it, exactly like the
// small card does, keeps fullscreen a bigger version of the same view.
function fitFullscreenBox(ratio: number, viewportW: number, viewportH: number) {
  const maxW = viewportW * 0.8;
  const maxH = viewportH * 0.8;
  let width = maxW;
  let height = width / ratio;
  if (height > maxH) {
    height = maxH;
    width = height * ratio;
  }
  return { width, height };
}

// Only read at fullscreen-open time (via a click), never during SSR/initial
// render, so there's no hydration-mismatch risk in starting at 0x0.
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function update() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

// The generate card's max height is computed in JS (via fitBox) rather than
// a CSS class, so it needs its own media-query check instead of a Tailwind
// breakpoint class. Always starts `false` on both server and the first client render
// (matching what SSR renders, since `window` doesn't exist there) and only
// switches after mount — reading matchMedia in the initial useState would
// make the client's first render disagree with the server-rendered HTML
// whenever the real viewport is wide, causing a hydration mismatch.
function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(LARGE_SCREEN_QUERY);
    const handler = () => setIsLarge(mq.matches);
    handler();
    // Belt-and-suspenders: also re-check on window resize, not just
    // matchMedia's own "change" event — costs nothing and removes any
    // doubt about that event's reliability across browsers.
    mq.addEventListener("change", handler);
    window.addEventListener("resize", handler);
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);
  return isLarge;
}

const GenerateContent = () => {
  const searchParams = useSearchParams();
  const isGenerating = searchParams.get('generating') === '1';
  const { selections } = useOptionSelection();
  const { generations, addGeneration } = useGenerations();
  const ratio = selections.aspectRatio?.ratio ?? 3 / 4;

  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const isLargeScreen = useIsLargeScreen();
  const windowSize = useWindowSize();

  useEffect(() => {
    if (!isGenerating) return;
    setPhase('loading');
    // Dummy 3s stand-in for the real generation API — swap the timeout +
    // dummyResult for the actual request/response once it's wired up.
    const timer = setTimeout(() => {
      const newItem: GenerationItem = { id: `gen-${Date.now()}`, image: dummyResult.src, ratio };
      addGeneration(newItem);
      setViewingId(newItem.id);
      setPhase('done');
    }, 6000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  if (!isGenerating) {
    return (
      <div className='w-full h-full flex items-center justify-center bg-neutral-900'>
        <div className='relative w-[377px] h-[493px] items-center flex mb-[80px] justify-center'>
          <Image src={modalimg} alt="Model shot preview" fill className='object-cover' />
          <div className='absolute h-[76px]  -bottom-[36px] flex flex-col items-center justify-center gap-[8px]'>
            <p className='text-title-h6 text-strong'>Create your model shot</p>
            <p className='text-center text-sub text-paragraph-sm'>Select your options from the right to <br /> create your shot.</p>
          </div>
        </div>
      </div>
    );
  }

  const cardMaxH = isLargeScreen ? CARD_MAX_H_LARGE : CARD_MAX_H_SMALL;
  // The card being generated (not shown yet) is always the current
  // selection's ratio; once a result is showing, the card must follow THAT
  // specific generation's own stored ratio — never the current selection —
  // since an older thumbnail with a different ratio can be clicked back into
  // view without touching the current selection.
  const loadingCard = fitBox(ratio, cardMaxH);
  const viewing = generations.find((g) => g.id === viewingId) ?? generations[generations.length - 1];
  const doneCard = viewing ? fitBox(viewing.ratio, cardMaxH) : loadingCard;

  const total = generations.length;
  const showStrip = total >= 2;
  const showOverflow = total >= 5;
  const stripItems = showOverflow ? generations.slice(-5, -1) : generations.slice(-4);
  const latest = generations[total - 1];

  return (
    <div className='w-full h-full flex flex-col items-center justify-center bg-neutral-900 gap-[24px]'>
      {phase === 'loading' && (
        <div
          style={{ width: loadingCard.width, height: loadingCard.height }}
          className='relative rounded-[24px] overflow-hidden flex items-center justify-center bg-surface-soft'
        >
          <video
            src="/Generating.webm"
            autoPlay
            loop
            muted
            playsInline
            className='absolute inset-0 w-full h-full object-cover'
          />
          <p className='relative text-paragraph-sm text-strong flex items-center'>
            Generating
            <span className='loading-dot' style={{ animationDelay: '0s' }}>.</span>
            <span className='loading-dot' style={{ animationDelay: '0.2s' }}>.</span>
            <span className='loading-dot' style={{ animationDelay: '0.4s' }}>.</span>
          </p>
        </div>
      )}

      {phase === 'done' && viewing && (
        <>
          <motion.div
            // Without this, Framer still has to resolve a starting point for
            // the very first mount, and any transient/stale doneCard value on
            // that first render becomes a real scale-up animation into place.
            // `initial={false}` guarantees the very first paint jumps
            // straight to the final size — no scale-in — while later size
            // changes (switching to a different-ratio thumbnail) still
            // animate normally via `animate`.
            initial={false}
            animate={{ width: doneCard.width, height: doneCard.height }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className='relative rounded-[18.67px] overflow-hidden bg-surface-soft'
          >
            {/* `animate` on real width/height (not the `layout` prop) makes
                Framer tween the actual box-model size frame by frame, so
                object-cover keeps recalculating against the image's true
                aspect ratio the whole time. `layout` instead uses a
                transform-based FLIP trick that visibly stretches/squishes
                the image while the box scales between two different aspect
                ratios. */}
            <Image src={viewing.image} alt="Generated result" fill unoptimized className='object-cover' />
            <div
              onClick={() => setFullscreen(true)}
              className='absolute top-[12px] right-[12px] w-[32px] h-[32px]  rounded-[8px] bg-black-60 flex items-center justify-center cursor-pointer'
            >
             <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3.33366 13.333V16.6663H6.66699M3.33366 16.6663L8.33366 11.6663M16.667 6.66634V3.33301H13.3337M16.667 3.33301L11.667 8.33301" stroke="#EBEDF0" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
            </div>
          </motion.div>

          <motion.button
            layout
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ width: 368 }}
            className='s-btn-noicon-48  text-label-sm text-strong cursor-pointer'
          >
            Download
          </motion.button>

          {showStrip && (
            // mt-[8px] on small/medium (tablet, incl. 13"-15" laptops) screens,
            // mt-[32px] on 2xl+ — on top of the parent's gap-[24px]. `layout` on this + the
            // siblings above turns the "image/button suddenly jump up"
            // reflow (when this strip first mounts, or grows past 4 items)
            // into a smooth animated shift instead of an instant snap;
            // initial/animate gives the strip itself a fade+slide-in the
            // first time it appears.
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className='flex flex-row gap-[12px] items-end mt-[8px] 2xl:mt-[32px]'>
              {stripItems.map((g) => {
                const itemThumb = thumbBox(g.ratio);
                return (
                  <button
                    key={g.id}
                    onClick={() => setViewingId(g.id)}
                    style={{ width: itemThumb.width, height: itemThumb.height }}
                    className={`relative rounded-[12px] overflow-hidden bg-surface-soft cursor-pointer ${
                      g.id === viewing.id ? 'shadow-[0_0_0_2px_#FFF] border-[2px] border-[#000000]' : ''
                    }`}
                  >
                    <Image src={g.image} alt="" fill unoptimized className='object-cover' />
                  </button>
                );
              })}

              {showOverflow && latest && (() => {
                const overflowThumb = thumbBox(latest.ratio);
                return (
                  <Link
                    href="/gallery"
                    style={{ width: overflowThumb.width, height: overflowThumb.height }}
                    className='relative rounded-[12px]  overflow-hidden flex  items-center justify-center  cursor-pointer'
                  >
                    <Image src={latest.image} alt="" fill unoptimized className='object-cover' / >
                    <span className='relative tracking-[-0.5%] text-strong z-20 text-[0.7em]'>View all</span>
                    <div className='absolute bg-black-80 pointer-events-none inset-0'></div>
                  </Link>
                );
              })()}
            </motion.div>
          )}
        </>
      )}

      {fullscreen && viewing && createPortal(
        // Portaled straight to <body> — a `fixed inset-0` here otherwise
        // gets contained by whichever ancestor up the tree has a CSS
        // transform (Framer Motion leaves one on animated elements), so the
        // backdrop silently covers less than the real viewport instead of
        // all of it. Portaling escapes that entirely.
        (() => {
          const fsBox = fitFullscreenBox(viewing.ratio, windowSize.width, windowSize.height);
          return (
            <div
              onClick={() => setFullscreen(false)}
              className='fixed inset-0 z-50 bg-black-90 flex items-center justify-center'
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className='relative rounded-[8px] overflow-hidden'
                style={{ width: fsBox.width, height: fsBox.height }}
              >
                {/* object-cover, matching the small card exactly — this is
                    meant to be a bigger version of the same preview, not a
                    reveal of the dummy source photo's own raw, uncropped
                    shape. */}
                <Image src={viewing.image} alt="Generated result" fill unoptimized className='object-cover' />
             
              </div>
                 <div
                  onClick={() => setFullscreen(false)}
                  className='absolute top-[24px] right-[24px] w-[36px] h-[36px] rounded-full bg-surface-light flex items-center justify-center text-strong cursor-pointer'
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  )
}

const Page = () => (
  <Suspense fallback={null}>
    <GenerateContent />
  </Suspense>
);

export default Page
