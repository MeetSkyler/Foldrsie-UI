// ......Feedback........//
// Desktop never navigates here (sidebar intercepts "Share feedback" to open
// FeedbackModal.tsx instead) — this route exists for mobile's bottom nav,
// which links straight to /feedback as a real page.
import MobileFeedbackHome from "@/app/components/mobile/MobileFeedbackHome";

export default function FeedbackPage() {
  return (
    <>
      <div className="hidden md:flex w-full h-full items-center justify-center bg-rose-900">
        <p className="text-title-h6 text-strong">Feedback</p>
      </div>
      <MobileFeedbackHome />
    </>
  );
}
