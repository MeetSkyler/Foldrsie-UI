"use client";
// ......MobileGenerationToast........//
// Mobile counterpart of GenerationToast.tsx — same shared context, same
// states/copy, just sized/positioned for mobile: full width (minus the
// shell's own padding) and pinned 16px above the bottom nav bar rather than
// the viewport edge (see MobileAppshell.tsx, which wraps this + the
// scrollable page content in a shared `relative` parent so `bottom-[16px]`
// here lands just above the nav bar instead of under it).
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useGenerations } from "@/app/context/generations-context";

const THUMB_HEIGHT = 48;

const COPY = {
  loading: { title: "Creating your image...", subtitle: "You can keep using foldrise", action: "Open" },
  done: { title: "Your image is ready", subtitle: "Saved to your gallery", action: "View results" },
  error: { title: "Generation failed", subtitle: "Your credits were returned", action: "Try again" },
  offline: { title: "Generation interrupted", subtitle: "1 credit was used for this attempt.", action: "Try again" },
} as const;

export default function MobileGenerationToast() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeToast, dismissToast } = useGenerations();

  if (!activeToast || pathname === "/generate") return null;
  // The user already saw this result on the generation screen — nothing
  // new to surface here.
  if (activeToast.status === "done" && activeToast.viewed) return null;

  const thumbWidth = THUMB_HEIGHT * activeToast.ratio;
  const copy = COPY[activeToast.status];

  return (
    <div className="flex md:hidden absolute inset-x-0 bottom-[16px] justify-center px-[16px] z-40 pointer-events-none">
      <div
        className="pointer-events-auto relative flex flex-row items-center justify-between gap-[8px] bg-surface-weak w-full border border-line-strong rounded-[16px] py-[10px] pl-[10px] pr-[16px]"
        style={{ boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.4)" }}
      >
        <div className="flex flex-row items-center gap-[12px] min-w-0">
          <div
            className="relative rounded-[8px] overflow-hidden shrink-0 bg-surface-soft flex items-center justify-center"
            style={{ width: thumbWidth, height: THUMB_HEIGHT }}
          >
            {activeToast.status === "loading" && (
              <video src="/Generating.webm" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
            )}
            {activeToast.status === "done" && activeToast.image && (
              <Image src={activeToast.image} alt="" fill unoptimized className="object-cover" />
            )}
            {activeToast.status === "error" && (
              <div className="w-full h-full flex items-center justify-center bg-[#E82B47]/8">
                <div className="flex items-center rounded-full justify-center w-[18px] h-[18px] bg-[#E82B47]/25">
                  <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                    <path d="M9.375 3.125L3.125 9.375M3.125 3.125L9.375 9.375" stroke="#FC8989" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
            {activeToast.status === "offline" && (
              <div className="w-full h-full flex items-center justify-center bg-[#DD530F]/8">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 15H10.0083M7.64323 12.6433C8.26832 12.0184 9.11602 11.6674 9.9999 11.6674C10.8838 11.6674 11.7315 12.0184 12.3566 12.6433M5.28564 10.2858C6.16934 9.39964 7.28562 8.78141 8.50564 8.5025M11.9748 8.63167C13.0103 8.95503 13.9508 9.52728 14.714 10.2983M2.92928 7.92917C3.78215 7.07452 4.78274 6.38139 5.88261 5.88333M8.46678 5.11667C10.021 4.87567 11.6102 5.00468 13.1052 5.49322C14.6002 5.98176 15.9589 6.81606 17.0709 7.92833M2.5 2.5L17.5 17.5" stroke="#F7915F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-[2px] min-w-0">
            <p className="text-label-sm text-strong truncate">{copy.title}</p>
            <p className="text-paragraph-xs text-sub truncate">{copy.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/generate")}
          className={`${activeToast.status === "loading" ? "s-btn-noicon-32" : "p-btn-noicon-32"} text-label-sm shrink-0 items-center flex justify-center whitespace-nowrap cursor-pointer transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px`}
        >
          {copy.action}
        </button>

        <div
          onClick={dismissToast}
          className="absolute -top-[8px] -right-[8px] w-[24px] h-[24px] border-[0.75px] border-line-strong rounded-full bg-surface-light flex items-center justify-center cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
