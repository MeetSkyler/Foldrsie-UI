// ......MobileAppshell........//
// Dummy colors mark where the top/bottom bars sit — the actual content
// inside them now comes from their own components (MobileTopBar /
// MobileBottomNav), so styling each one is separate from this layout.
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";
import MobileGenerationToast from "./MobileGenerationToast";
import Link from 'next/link';


export default function MobileAppshell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-dvh flex flex-col">
      {/* ....TopNav..... */}
      <div className="w-full shrink-0">
        <MobileTopBar />
      </div>

      {/* ....Center (pages render here)..... */}
      {/* The toast sits in this wrapper (not inside the scrolling div
          itself) so it stays pinned to the content area's own bottom edge —
          i.e. 16px above the bottom nav — instead of scrolling away with
          the page underneath it. */}
      <div className="relative flex-1 min-h-0">
        <div className="w-full h-full overflow-y-auto overscroll-none [touch-action:manipulation]">{children}</div>
        <MobileGenerationToast />
      </div>

      {/* ....BottomNav..... */}
      <div className="w-full  shrink-0 ">
        <MobileBottomNav />
      </div>
    </div>
  );
}
