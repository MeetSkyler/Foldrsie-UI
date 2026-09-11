// ......Pricing........//
// Desktop never navigates here (navbar's "Pricing" buttons open
// PricingModal.tsx instead) — this route exists for mobile's top bar, which
// links straight to /pricing as a real page.
import MobilePricingHome from "@/app/components/mobile/MobilePricingHome";

export default function PricingPage() {
  return (
    <>
      <div className="hidden md:flex w-full h-full items-center justify-center bg-indigo-900">
        <p className="text-title-h6 text-strong">Pricing</p>
      </div>
      <MobilePricingHome />
    </>
  );
}
