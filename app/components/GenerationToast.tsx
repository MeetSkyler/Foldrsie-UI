"use client";
// ......GenerationToast........//
// Floating status card shown while a generation is in flight (or its
// result hasn't been dismissed yet) on every page EXCEPT /generate itself,
// which already has its own full-size loading/done card — this is purely
// so the user can navigate elsewhere mid-generation without losing track
// of it. Desktop only for now; mobile gets its own treatment later.
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useGenerations } from "@/app/context/generations-context";

const THUMB_HEIGHT = 58;

const COPY = {
  loading: { title: "Creating your image...", subtitle: "You can keep using foldrise", action:{label:"Open",className:'px-[4px]'} },
  done: { title: "Your image is ready", subtitle: "Saved to your gallery", action:{label:"View results",className: 'px-[4px]'} },
  error: { title: "Generation failed", subtitle: "Your credits were returned", action:{label:"Try again",className: 'px-[4px]'} },
  offline: { title: "Generation interrupted", subtitle: "1 credit was used for this attempt.", action:{label:"Try again",className: 'px-[4px]'} },
} as const;

export default function GenerationToast() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeToast, dismissToast } = useGenerations();

  if (!activeToast || pathname === "/generate") return null;
  // The user already saw this result on /generate — nothing new to surface.
  if (activeToast.status === "done" && activeToast.viewed) return null;

  const thumbWidth = THUMB_HEIGHT * activeToast.ratio;
  const copy = COPY[activeToast.status];

  return (
    <div className="hidden md:flex absolute inset-x-0 bottom-[16px] justify-center px-[16px] z-40 pointer-events-none">
      <div
        className="pointer-events-auto relative flex flex-row items-center justify-between  bg-surface-weak w-[480px] border border-line-strong rounded-[16px] py-[12px] pl-[12px] pr-[20px]"
      >

     {/* .......Block1..... */}
      <div className="flex flex-row items-center gap-[16px]">
         {/* .........ImageArea.......... */}
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
            <div className="w-full h-full flex items-center justify-center  bg-[#E82B47]/8">
            <div className="flex items-center rounded-full justify-center w-[20px] h-[20px] bg-[#E82B47]/25">
              <svg  width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9.375 3.125L3.125 9.375M3.125 3.125L9.375 9.375" stroke="#FC8989" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            </div>
          )}

          {activeToast.status === "offline" && (
            <div className="w-full h-full flex items-center justify-center bg-[#DD530F]/8">
              <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 15H10.0083M7.64323 12.6433C8.26832 12.0184 9.11602 11.6674 9.9999 11.6674C10.8838 11.6674 11.7315 12.0184 12.3566 12.6433M5.28564 10.2858C6.16934 9.39964 7.28562 8.78141 8.50564 8.5025M11.9748 8.63167C13.0103 8.95503 13.9508 9.52728 14.714 10.2983M2.92928 7.92917C3.78215 7.07452 4.78274 6.38139 5.88261 5.88333M8.46678 5.11667C10.021 4.87567 11.6102 5.00468 13.1052 5.49322C14.6002 5.98176 15.9589 6.81606 17.0709 7.92833M2.5 2.5L17.5 17.5" stroke="#F7915F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      
       {/* .........Text area.......... */}
        <div className="flex flex-col gap-[4px] whitespace-nowrap">
          <p className="text-label-sm text-strong">{copy.title}</p>
          <p className="text-paragraph-sm text-sub">{copy.subtitle}</p>
        </div>

      </div>



        
      {/* ............btn......... */}
        <button
          onClick={() => router.push("/generate")}
          className={`${activeToast.status === "loading" ? "s-btn-noicon-32 " : "p-btn-noicon-32"} text-label-sm shrink-0 items-center flex justify-center whitespace-nowrap cursor-pointer transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px`}
        >
          <p className={copy.action.className}>{copy.action.label}</p>
        </button>


      {/* .........CrosssIcon.......... */}
        <div
          onClick={dismissToast}
          className="absolute -top-[8px] -right-[8px] group w-[24px] h-[24px] border-[0.75px] border-line-strong  rounded-full bg-surface-light flex items-center justify-center cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-sub cursor-pointer group-hover:text-strong">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
