"use client";
import { useLayoutEffect, useState, type RefObject } from "react";

// Cards across the option pickers enforce a 184px min-width (min-w-[184px])
// so their text never overlaps at any zoom level. But the zoom slider can
// still *ask* for more columns than the grid's container can fit at that
// min-width — without this, the extra columns silently overflow past the
// container and get clipped off-screen (hidden behind the sidebar, with no
// way to scroll to them). This clamps the desired column count down to
// whatever actually fits the container's current width.
//
// MIN_CARD_WIDTH / GRID_GAP / GRID_PADDING_X must match each picker's card
// min-w, grid gap, and grid px- padding (each side).
const MIN_CARD_WIDTH = 184; // px
const GRID_GAP = 16; // px
const GRID_PADDING_X = 20; // px

function computeFit(contentWidth: number) {
  return Math.max(1, Math.floor((contentWidth + GRID_GAP) / (MIN_CARD_WIDTH + GRID_GAP)));
}

export function useResponsiveColumns(ref: RefObject<HTMLElement | null>, desiredColumns: number) {
  const [maxFit, setMaxFit] = useState(desiredColumns);

  // A ResizeObserver's first callback fires asynchronously and can catch the
  // container mid-layout (e.g. before the page has fully settled), so relying
  // on it alone can permanently stick maxFit at a too-narrow guess even after
  // the container reaches its real, final width. useLayoutEffect measures
  // synchronously before paint so the first render already has the correct
  // value; the observer only needs to handle *later* real size changes
  // (sidebar collapse, window resize).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    function measure() {
      const contentWidth = el!.getBoundingClientRect().width - GRID_PADDING_X * 2;
      setMaxFit(computeFit(contentWidth));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return Math.min(desiredColumns, maxFit);
}
