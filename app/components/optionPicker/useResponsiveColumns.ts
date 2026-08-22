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

function computeFit(contentWidth: number, minCardWidth: number) {
  return Math.max(1, Math.floor((contentWidth + GRID_GAP) / (minCardWidth + GRID_GAP)));
}

// Shared measurement: how many minCardWidth-or-wider columns actually fit
// the container right now. A ResizeObserver's first callback fires
// asynchronously and can catch the container mid-layout (e.g. before the
// page has fully settled), so relying on it alone can permanently stick the
// result at a too-narrow guess even after the container reaches its real,
// final width. useLayoutEffect measures synchronously before paint so the
// first render already has the correct value; the observer only needs to
// handle *later* real size changes (sidebar collapse, window resize).
function useMaxFitColumns(ref: RefObject<HTMLElement | null>, minCardWidth: number) {
  const [maxFit, setMaxFit] = useState(6); // generous default until the first real measurement lands before paint

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    function measure() {
      const contentWidth = el!.getBoundingClientRect().width - GRID_PADDING_X * 2;
      setMaxFit(computeFit(contentWidth, minCardWidth));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, minCardWidth]);

  return maxFit;
}

export function useResponsiveColumns(ref: RefObject<HTMLElement | null>, desiredColumns: number) {
  const maxFit = useMaxFitColumns(ref, MIN_CARD_WIDTH);
  return Math.min(desiredColumns, maxFit);
}

// Caps each candidate stop at what actually fits, then collapses
// consecutive duplicates — keeps the array descending and guarantees no two
// stops ever render the same column count (and therefore the same card
// size) at the current container width. `rawStops` must already be
// descending (e.g. [6,5,4,3,2]).
export function capAndDedupe(rawStops: number[], maxFit: number): number[] {
  const capped = rawStops.map((c) => Math.min(c, maxFit));
  return capped.filter((c, i) => i === 0 || c !== capped[i - 1]);
}

export { useMaxFitColumns };
