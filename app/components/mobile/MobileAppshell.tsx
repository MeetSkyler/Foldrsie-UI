// ......MobileAppshell........//
// Dummy colors mark where the top/bottom bars sit — the actual content
// inside them now comes from their own components (MobileTopBar /
// MobileBottomNav), so styling each one is separate from this layout.
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";
import Link from 'next/link';


export default function MobileAppshell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* ....TopNav..... */}
      <div className="w-full shrink-0 bg-blue-400">
        <MobileTopBar />
      </div>

      {/* ....Center (pages render here)..... */}
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>

      {/* ....BottomNav..... */}
      <div className="w-full  shrink-0 bg-green-400">
        <MobileBottomNav />
      </div>
    </div>
  );
}
