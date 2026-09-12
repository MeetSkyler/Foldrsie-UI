"use client";
import { useState } from "react";

// Browsers never put a `File` in dataTransfer.files when what's dragged is an
// <img> from a webpage (as opposed to a real file from Finder/Explorer) —
// only a URL, exposed as text/uri-list, an `<img src="...">` snippet in
// text/html, or (Firefox) text/x-moz-url ("URL\nTitle"). This pulls whichever
// of those is present so a website-image drag can still be handled.
function extractDroppedImageUrl(dataTransfer: DataTransfer): string | null {
  const uriList = dataTransfer.getData("text/uri-list");
  if (uriList) {
    const url = uriList.split("\n").find((line) => line && !line.startsWith("#"));
    if (url) return url.trim();
  }
  const mozUrl = dataTransfer.getData("text/x-moz-url");
  if (mozUrl) {
    const url = mozUrl.split("\n")[0];
    if (url) return url.trim();
  }
  const html = dataTransfer.getData("text/html");
  if (html) {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) return match[1];
  }
  const plain = dataTransfer.getData("text/plain");
  if (plain && /^https?:\/\//i.test(plain.trim())) return plain.trim();
  return null;
}

// Reusable HTML5 drag-and-drop for image upload targets — every upload
// card/slot in the app (option-picker cards, garment upload slots, profile
// photo) wires these three handlers alongside whatever `<input type="file">`
// change handler it already has, so dropping an image works everywhere a
// click-to-browse file picker already does. `isDragging` is exposed so a
// caller CAN show a highlight while something is dragged over it — desktop
// call sites use it, mobile call sites simply don't read it, since a
// hover-style highlight doesn't make sense on a touch screen.
//
// Handles two kinds of drops: a local file via `onFile` (dragging from
// Finder/Explorer — dataTransfer.files is populated), and an image dragged
// in from a webpage via `onUrl` (no File available, only a URL — see
// extractDroppedImageUrl above). A cross-origin URL is used directly as the
// image src rather than fetched into a blob — fetching would usually be
// blocked by CORS just to read the bytes, and every image field in this app
// is already typed as a plain string and rendered unoptimized when it is
// one, so a remote https:// URL works exactly like a blob: URL here.
export function useImageDragDrop(onFile: (file: File) => void, onUrl?: (url: string) => void) {
  const [isDragging, setIsDragging] = useState(false);

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFile(file);
      return;
    }
    const url = extractDroppedImageUrl(e.dataTransfer);
    if (url && onUrl) onUrl(url);
  }

  return { isDragging, onDragOver, onDragLeave, onDrop };
}
