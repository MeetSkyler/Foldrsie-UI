// ......Settings........//
// Desktop never navigates here (sidebar's "Settings" opens SettingsModal.tsx
// instead) — this route exists for mobile's bottom nav, which links
// straight to /settings as a real page.
import { Suspense } from "react";
import MobileSettingsHome from "@/app/components/mobile/MobileSettingsHome";

export default function SettingsPage() {
  return (
    <>
      <div className="hidden md:flex w-full h-full items-center justify-center bg-amber-900">
        <p className="text-title-h6 text-strong">Settings</p>
      </div>
      {/* MobileSettingsHome reads ?tab= via useSearchParams, which Next.js
          requires a Suspense boundary for. */}
      <Suspense fallback={null}>
        <MobileSettingsHome />
      </Suspense>
    </>
  );
}
