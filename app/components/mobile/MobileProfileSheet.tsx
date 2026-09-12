"use client";
// ......MobileProfileSheet........//
// Mobile counterpart of profiledropdown.tsx (desktop navbar's profile
// dropdown) — same data and actions (My account/Billing/Usage/Logout,
// credits + Upgrade), presented as an iOS-style bottom sheet instead of a
// small anchored dropdown, matching every other mobile sheet in this app
// (PhotoGuideSheet, MobileColorPickerSheet, MobileGarmentUploadSheet).
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import profile from "@/public/Profilesimple.svg";
import LogoutConfirmDialog from "@/app/components/LogoutConfirmDialog";
import { useAuthModal } from "@/app/context/auth-modal-context";
import type { SettingsTab } from "@/app/context/settings-modal-context";

const DRAG_DISMISS_DISTANCE = 120;
const DRAG_DISMISS_VELOCITY = 500;
const SHEET_SPRING = { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.9 };
const SHEET_ENTER = { type: "tween" as const, duration: 0.32, ease: [0.32, 0.72, 0, 1] as const };

// Same 3 rows as profiledropdown.tsx's MENU_ITEMS, `tab` driving which
// mobile Settings tab (?tab=...) opening that row lands on.
const MENU_ITEMS: { label: string; tab: SettingsTab; icon: React.ReactNode }[] = [
  {
    label: "My account",
    tab: "account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 17.5V15.8333C5 14.9493 5.35119 14.1014 5.97631 13.4763C6.60143 12.8512 7.44928 12.5 8.33333 12.5H11.6667C12.5507 12.5 13.3986 12.8512 14.0237 13.4763C14.6488 14.1014 15 14.9493 15 15.8333V17.5M6.66667 5.83333C6.66667 6.71739 7.01786 7.56523 7.64298 8.19036C8.2681 8.81548 9.11595 9.16667 10 9.16667C10.8841 9.16667 11.7319 8.81548 12.357 8.19036C12.9821 7.56523 13.3333 6.71739 13.3333 5.83333C13.3333 4.94928 12.9821 4.10143 12.357 3.47631C11.7319 2.85119 10.8841 2.5 10 2.5C9.11595 2.5 8.2681 2.85119 7.64298 3.47631C7.01786 4.10143 6.66667 4.94928 6.66667 5.83333Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Billing",
    tab: "billing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <g clipPath="url(#mobile_profile_clip_billing)">
          <line x1="4.76699" y1="13.566" x2="5.65033" y2="13.566" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="2.5" y="4.16602" width="15" height="11.6667" rx="1.66667" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="2.5" y1="7.73398" x2="17.5" y2="7.73399" stroke="currentColor" strokeWidth="1.2" />
        </g>
        <defs>
          <clipPath id="mobile_profile_clip_billing">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    label: "Usage",
    tab: "usage",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4.69667 16.1373C3.64779 15.0884 2.93349 13.752 2.64411 12.2971C2.35473 10.8423 2.50326 9.33428 3.07092 7.96384C3.63858 6.5934 4.59987 5.42206 5.83324 4.59796C7.0666 3.77385 8.51665 3.33398 10 3.33398C11.4834 3.33398 12.9334 3.77385 14.1668 4.59796C15.4001 5.42206 16.3614 6.5934 16.9291 7.96384C17.4968 9.33428 17.6453 10.8423 17.3559 12.2971C17.0665 13.752 16.3522 15.0884 15.3033 16.1373M13.3333 7.50065L10 10.834" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function MobileProfileSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { openLogin } = useAuthModal();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DRAG_DISMISS_DISTANCE || info.velocity.y > DRAG_DISMISS_VELOCITY) {
      onClose();
    }
  }

  function handleMenuItemClick(tab: SettingsTab) {
    onClose();
    router.push(`/settings?tab=${tab}`);
  }

  function handleConfirmLogout() {
    setIsLogoutConfirmOpen(false);
    onClose();
    openLogin();
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden">
            <motion.div
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 bg-black-90"
            />

            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={handleDragEnd}
              initial={{ y: "100%" }}
              animate={{ y: 0, transition: SHEET_ENTER }}
              exit={{ y: "100%", transition: SHEET_SPRING }}
              style={{ willChange: "transform" }}
              className="relative w-full bg-surface-weak rounded-t-[24px] flex flex-col"
            >
              <div className="shrink-0 flex flex-col gap-[5px] w-full pt-[6px] px-[16px]">
                <div className="w-full flex items-center justify-center py-[4px] cursor-grab active:cursor-grabbing">
                  <div className="w-[36px] h-[5px] rounded-full bg-surface-light" />
                </div>
              </div>

              <div className="flex flex-col gap-[16px] px-[16px] pt-[8px] pb-[max(16px,env(safe-area-inset-bottom))]">
                <div className="flex flex-row gap-[12px] items-center">
                  <div className="w-[44px] h-[44px] shrink-0 flex items-center justify-center">
                    <Image src={profile} alt="profile" width={100} height={100} />
                  </div>
                  <div className="flex flex-col gap-[2px] min-w-0">
                    <p className="text-paragraph-sm text-strong truncate">Aqib Javed</p>
                    <p className="text-paragraph-sm text-sub truncate">aqibbismillah@gmail.com</p>
                  </div>
                </div>

                <div className="p-[12px] w-full flex flex-row items-center bg-surface-light border border-line-strong justify-between rounded-[12px]">
                  <div className="flex flex-row items-center gap-[8px]">
                    <p className="text-paragraph-sm text-sub">Credits:</p>
                    <div className="flex flex-row gap-[4px] items-center justify-center">
                      <div className="w-[18px] h-[18px] flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                          <path d="M11.9429 0.116478C11.9354 0.0501816 11.8794 6.82869e-05 11.8126 6.94345e-08C11.7459 -6.80073e-05 11.6898 0.0499306 11.6821 0.116212C11.6042 0.792061 11.4009 1.27788 11.0644 1.61437C10.7279 1.95085 10.2421 2.15416 9.56621 2.23211C9.49993 2.23976 9.44993 2.29591 9.45 2.36263C9.45007 2.42935 9.50018 2.48541 9.56648 2.49292C10.2314 2.56823 10.7269 2.77142 11.0709 3.10919C11.4141 3.44618 11.622 3.9324 11.6818 4.60536C11.6878 4.67314 11.7446 4.72508 11.8126 4.725C11.8807 4.72492 11.9374 4.67286 11.9433 4.60507C12.0006 3.9429 12.2083 3.4471 12.5527 3.10268C12.8971 2.75826 13.3929 2.55058 14.0551 2.49326C14.1229 2.48739 14.1749 2.43069 14.175 2.36265C14.1751 2.2946 14.1231 2.23779 14.0554 2.23176C13.3824 2.17199 12.8962 1.96408 12.5592 1.62089C12.2214 1.27689 12.0182 0.781394 11.9429 0.116478Z" fill="#EBEDF0" fillOpacity="0.97" />
                          <path d="M6.41036 2.32451C6.39105 2.15404 6.24691 2.02518 6.07534 2.025C5.90378 2.02482 5.75938 2.15339 5.73972 2.32383C5.53928 4.06173 5.01648 5.31098 4.15123 6.17623C3.28598 7.04148 2.03673 7.56427 0.29883 7.76472C0.128393 7.78438 -0.000174876 7.92878 1.78547e-07 8.10034C0.000175595 8.27191 0.129038 8.41605 0.299515 8.43536C2.0093 8.62902 3.28344 9.15151 4.168 10.0201C5.0505 10.8866 5.58511 12.1369 5.73882 13.8674C5.7543 14.0416 5.90041 14.1752 6.07538 14.175C6.25035 14.1748 6.39615 14.0409 6.41124 13.8666C6.55863 12.1639 7.09268 10.889 7.97832 10.0033C8.86397 9.11768 10.1389 8.58363 11.8416 8.43624C12.0159 8.42115 12.1498 8.27535 12.15 8.10038C12.1502 7.92541 12.0166 7.7793 11.8424 7.76382C10.1119 7.61011 8.86161 7.07549 7.99507 6.193C7.12651 5.30844 6.60402 4.0343 6.41036 2.32451Z" fill="#EBEDF0" fillOpacity="0.97" />
                        </svg>
                      </div>
                      <p className="text-paragraph-sm text-strong">120</p>
                    </div>
                  </div>
                  <button className="h-[24px] px-[8px] py-[2px] text-darker bg-surface-white items-center justify-center flex text-label-sm rounded-[6px] cursor-pointer">Upgrade</button>
                </div>

                <div className="flex flex-col gap-[4px]">
                  {MENU_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      onClick={() => handleMenuItemClick(item.tab)}
                      className="px-[8px] py-[10px] flex w-full cursor-pointer text-sub rounded-[8px] active:bg-surface-alpha-light-weak items-center flex-row gap-[8px]"
                    >
                      {item.icon}
                      <p className="text-paragraph-sm text-sub">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-[8px] border-t border-line-strong">
                  <div
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="px-[8px] py-[10px] w-full cursor-pointer rounded-[8px] active:bg-surface-alpha-light-weak flex items-center flex-row gap-[8px]"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-sub">
                      <path d="M8.33333 6.66536V4.9987C8.33333 4.55667 8.50893 4.13275 8.82149 3.82019C9.13405 3.50763 9.55797 3.33203 10 3.33203H15.8333C16.2754 3.33203 16.6993 3.50763 17.0118 3.82019C17.3244 4.13275 17.5 4.55667 17.5 4.9987V14.9987C17.5 15.4407 17.3244 15.8646 17.0118 16.1772C16.6993 16.4898 16.2754 16.6654 15.8333 16.6654H10C9.55797 16.6654 9.13405 16.4898 8.82149 16.1772C8.50893 15.8646 8.33333 15.4407 8.33333 14.9987V13.332M12.5 9.9987H2.5M5 12.4987L2.5 9.9987L5 7.4987" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-paragraph-sm text-sub">Logout</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LogoutConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
