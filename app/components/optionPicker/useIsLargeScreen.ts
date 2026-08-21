"use client";
import { useEffect, useState } from "react";

// Matches the same 1441px breakpoint used for the generate page's card
// sizing — screens above this get the fuller (Gallery-style) zoom range,
// screens at/below it keep the reduced range. Always starts `false` on both
// server and the first client render (there's no `window` on the server),
// switching only after mount via matchMedia + resize, so the client's first
// render never disagrees with the server-rendered HTML.
const LARGE_SCREEN_QUERY = "(min-width: 1441px)";

export function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(LARGE_SCREEN_QUERY);
    const handler = () => setIsLarge(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    window.addEventListener("resize", handler);
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);
  return isLarge;
}
