"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSettingsModal } from "@/app/context/settings-modal-context";
import Image from 'next/image';
import profile from '@/public/Profilesimple.svg'
import usageThumb1 from '@/public/img1.jpg'
import usageThumb2 from '@/public/img4.jpg'
import { div } from "motion/react-client";


const SETTINGS_TABS = [
  {
    id: "account",
    label: "My account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 17.5V15.8333C5 14.9493 5.35119 14.1014 5.97631 13.4763C6.60143 12.8512 7.44928 12.5 8.33333 12.5H11.6667C12.5507 12.5 13.3986 12.8512 14.0237 13.4763C14.6488 14.1014 15 14.9493 15 15.8333V17.5M6.66667 5.83333C6.66667 6.71739 7.01786 7.56523 7.64298 8.19036C8.2681 8.81548 9.11595 9.16667 10 9.16667C10.8841 9.16667 11.7319 8.81548 12.357 8.19036C12.9821 7.56523 13.3333 6.71739 13.3333 5.83333C13.3333 4.94928 12.9821 4.10143 12.357 3.47631C11.7319 2.85119 10.8841 2.5 10 2.5C9.11595 2.5 8.2681 2.85119 7.64298 3.47631C7.01786 4.10143 6.66667 4.94928 6.66667 5.83333Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "billing",
    label: "Billing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <g clipPath="url(#settings_clip_billing)">
          <line x1="4.76699" y1="13.566" x2="5.65033" y2="13.566" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="2.5" y="4.16602" width="15" height="11.6667" rx="1.66667" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="2.5" y1="7.73398" x2="17.5" y2="7.73399" stroke="currentColor" strokeWidth="1.2" />
        </g>
        <defs>
          <clipPath id="settings_clip_billing">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    id: "usage",
    label: "Usage",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4.69667 16.1373C3.64779 15.0884 2.93349 13.752 2.64411 12.2971C2.35473 10.8423 2.50326 9.33428 3.07092 7.96384C3.63858 6.5934 4.59987 5.42206 5.83324 4.59796C7.0666 3.77385 8.51665 3.33398 10 3.33398C11.4834 3.33398 12.9334 3.77385 14.1668 4.59796C15.4001 5.42206 16.3614 6.5934 16.9291 7.96384C17.4968 9.33428 17.6453 10.8423 17.3559 12.2971C17.0665 13.752 16.3522 15.0884 15.3033 16.1373M13.3333 7.50065L10 10.834" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

// Each row shares the same label+wrapper markup — only the value content
// (plain text, a date range, a badge, etc.) differs — so the row shell is
// written once here and reused via .map() below.
const PLAN_DETAILS = [
  {
    label: "Plan",
    value: (
      <div className="flex flex-row gap-[12px] items-center">
        <p className="text-paragraph-sm text-strong">Growth</p>
        <button className="px-[6px] py-[2px] bg-white-12 rounded-[6px] text-white-60 flex items-center justify-center text-label-xs">Billed monthly</button>
      </div>
    ),
  },
  {
    label: "Monthly charge",
    value: (
      <div className="flex flex-row items-center">
        <p className="text-paragraph-sm text-strong">$49</p>
        <p className="text-paragraph-sm text-sub">/month</p>
      </div>
    ),
  },
  {
    label: "Included credits",
    value: (
      <div className="flex flex-row items-center gap-[4px]">
        <p className="text-paragraph-sm text-strong">80 image credits</p>
        <p className="text-paragraph-sm text-sub">each month</p>
      </div>
    ),
  },
  {
    label: "Billing period",
    value: (
      <div className="flex flex-row items-center  gap-[4px]">
        <p className="text-paragraph-sm text-strong">Aug 14, 2026 – </p>
        <p className="text-paragraph-sm text-strong">Sep 14, 2026</p>
      </div>
    ),
  },
  {
    label: "Renewal date",
    value: <p className="text-paragraph-sm text-strong">Sep 19, 2026</p>,
  },
];

// Same idea for the billing history table — one row shell, one array of
// real values, reused via .map() so adding a new invoice is just one more
// object here.
const BILLING_HISTORY = [
  { date: "July 28, 2026", plan: "Starter", status: "Paid", amount: "$9" },
  { date: "August 15, 2026", plan: "40 credits", status: "Paid", amount: "$15" },
  { date: "September 10, 2026", plan: "30 credits", status: "Paid", amount: "$12" },
];

// Same table pattern for the usage history — a null `image` renders the
// red "failed" icon instead of a thumbnail.
const USAGE_HISTORY = [
  { date: "Aug 24, 11:31 AM", image: usageThumb1, type: "Standard 2K", status: "Completed", credits: "-1 credit" },
  { date: "Aug 24", image: null, type: "Standard 2K", status: "Failed", credits: "+1 credit returned" },
  { date: "Aug 24", image: usageThumb2, type: "Special 4K", status: "Completed", credits: "-2 credits" },
];

// The label + hover-tooltip-icon pairing is copied identically for every
// credit-breakdown row, in both the "has usage" and "no usage yet" states —
// pulled into one component so each row only has to supply its own
// description text.
function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="relative group cursor-pointer">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 6H8.00667M7.33333 8H8V10.6667H8.66667M2 8C2 8.78793 2.15519 9.56815 2.45672 10.2961C2.75825 11.0241 3.20021 11.6855 3.75736 12.2426C4.31451 12.7998 4.97595 13.2418 5.7039 13.5433C6.43185 13.8448 7.21207 14 8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2418 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2418 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 6.4087 13.3679 4.88258 12.2426 3.75736C11.1174 2.63214 9.5913 2 8 2C6.4087 2 4.88258 2.63214 3.75736 3.75736C2.63214 4.88258 2 6.4087 2 8Z" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute p-[10px] pointer-events-none group-hover:opacity-100 transition-opacity duration-200 ease-out rounded-[12px] border border-line-sub opacity-0 bg-surface-light w-[209px] bottom-[18px]">
        <p className="text-paragraph-xs text-sub ">{text}</p>
      </div>
    </div>
  );
}

// Reads the viewport height. SettingsModal itself is always mounted (it's
// rendered unconditionally in layout.tsx, only its own JSX output is gated
// behind isSettingsOpen), so this hook's very first call can happen during
// Next.js's server-side render, where `window` doesn't exist yet — the
// lazy initializer falls back to 0 there. The effect below corrects it to
// the real value as soon as the component mounts on the client, well
// before the user ever gets a chance to open the modal, so there's no
// visible flash of a wrong height in practice.
function useViewportHeight() {
  const [height, setHeight] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 0));
  useEffect(() => {
    function update() {
      setHeight(window.innerHeight);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return height;
}

const SettingsModal = () => {
  const { isSettingsOpen, closeSettings } = useSettingsModal();
  const [isTopHovered, setIsTopHovered] = useState(false);
  const viewportHeight = useViewportHeight();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isExtraCreditsOpen, setIsExtraCreditsOpen] = useState(false);
  // Same hover/fill/autofill states as the login email input (see
  // loginPortion.tsx and globals.css's onAutofillDetect keyframe).
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [isEmailAutofilled, setIsEmailAutofilled] = useState(false);
  const isEmailFilled = deleteConfirmEmail.length > 0;
  const [keepImagesConfirmed, setKeepImagesConfirmed] = useState(false);
  const [understandPermanentConfirmed, setUnderstandPermanentConfirmed] = useState(false);
  const ACCOUNT_EMAIL = "aqibbismillah@gmail.com";
  const isDeleteValid = keepImagesConfirmed && understandPermanentConfirmed && deleteConfirmEmail.trim().toLowerCase() === ACCOUNT_EMAIL;
  const [billingData, setbillingData] = useState(true);
  const [usagedata, setusagedata] = useState(true)
  const [isAnnualPlan, setIsAnnualPlan] = useState(true)


  // Reset the confirm dialog's own state whenever it closes, so it doesn't
  // remember a stale typed email or checked boxes the next time it opens.
  useEffect(() => {
    if (!isDeleteConfirmOpen) {
      setDeleteConfirmEmail("");
      setIsEmailAutofilled(false);
      setKeepImagesConfirmed(false);
      setUnderstandPermanentConfirmed(false);
    }
  }, [isDeleteConfirmOpen]);
  const [activeTab, setActiveTab] = useState<(typeof SETTINGS_TABS)[number]["id"] | "logout">("account");
  const [savedName, setSavedName] = useState("Aqib Javed");
  const [fullName, setFullName] = useState(savedName);
  const isSaveDisabled = fullName.trim() === "" || fullName === savedName;

  function handleSaveName() {
    if (isSaveDisabled) return;
    setSavedName(fullName.trim());
    setFullName(fullName.trim());
  }

  // Profile photo: clicking "Upload photo" opens this hidden file input,
  // and the chosen file is read into a data URL so it can be shown directly
  // in the avatar circle without needing to upload it anywhere yet.
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setProfileImage(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  useEffect(() => {
    if (!isSettingsOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeSettings();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  useEffect(() => {
    if (!isSettingsOpen) setIsTopHovered(false);
  }, [isSettingsOpen]);

  return (
    <>
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          key="settings-backdrop"
          onClick={closeSettings}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`fixed inset-0 z-50 flex flex-col justify-end items-center pt-[46px] transition-colors duration-300 ${isDeleteConfirmOpen || isExtraCreditsOpen ? "bg-black-40" : "bg-black-90"}`}
        >
          {/* Hovering this top strip of exposed backdrop hints that it closes
              the modal, and nudges the panel down a touch so the hint reads
              as "this black area belongs to the backdrop, not the panel." */}
          <div
            onMouseEnter={() => setIsTopHovered(true)}
            onMouseLeave={() => setIsTopHovered(false)}
            className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-center"
          >
            {/* ......Exit settings bar ......... */}
            <AnimatePresence>
              {isTopHovered && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="px-[12px] py-[6px] rounded-full bg-surface-light text-label-sm text-strong pointer-events-none"
                >
                  Exit Setting
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* The parent's justify-end pins this panel's bottom edge in
              place, so animating height from 0 to full makes it grow
              upward from the bottom instead of just fading/scaling in.
              Animating to a plain pixel number (instead of "100%"/calc())
              lets Framer Motion tween it directly frame by frame, instead
              of re-resolving a percentage against the parent every frame —
              that extra work was the main cause of the glitch on first
              open. The "- 46" matches the backdrop's own pt-[46px]. */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ height: 0 }}
            animate={{ height: isTopHovered ? viewportHeight - 46 - 24 : viewportHeight - 46 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-surface-weak w-full rounded-tr-[24px] rounded-tl-[24px] overflow-hidden border border-line-sub flex flex-row"
          >
          {/* .................SideBar............... */}
            <div className="w-[240px]  h-full  flex flex-col items-center border-r border-line-sub">
                 <div className="w-full h-[56px] shrink-0 px-[24px] py-[16px] text-label-lg text-strong border-b border-line-sub">Settings</div>
                 <div className="w-full h-full  flex flex-col justify-between">

                  {/* .........toplinks........... */}
                  <div className="flex flex-col gap-[8px] w-full  px-[16px] pt-[24px]">
                    {SETTINGS_TABS.map((tab)=>{
                      const isActive = activeTab === tab.id;
                      return(
                           <div
                             key={tab.id}
                             onClick={() => setActiveTab(tab.id)}
                             className={`w-full px-[10px] py-[8px] cursor-pointer group flex items-center gap-[8px] rounded-[10px] transition-colors duration-300 ease-out ${isActive ? "bg-surface-soft" : " hover:bg-surface-alpha-light-soft"}`}
                           >
                            <i className={`shrink-0 ${isActive ? "text-strong" : "text-sub group-hover:text-strong"}`}>{tab.icon}</i>
                            <p className={`text-paragraph-sm ${isActive ? "text-strong" : "text-sub group-hover:text-strong"}`}>{tab.label}</p>
                           </div>
                    )
                    })
                  }
                  </div>

                  {/* .............bottomlinks......... */}
                  <div className="w-full pb-[16px] px-[16px] ">
                   <div
                     onClick={() => setActiveTab("logout")}
                     className={`w-full px-[10px] py-[8px] cursor-pointer group flex flex-row gap-[8px] items-center text-paragraph-sm rounded-[10px] ${activeTab === "logout" ? "bg-surface-soft" : " hover:bg-surface-alpha-light-soft"}`}
                   >
                     <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={`shrink-0 ${activeTab === "logout" ? "text-strong" : "text-sub group-hover:text-strong"}`}>
                     <path d="M8.33333 6.66536V4.9987C8.33333 4.55667 8.50893 4.13275 8.82149 3.82019C9.13405 3.50763 9.55797 3.33203 10 3.33203H15.8333C16.2754 3.33203 16.6993 3.50763 17.0118 3.82019C17.3244 4.13275 17.5 4.55667 17.5 4.9987V14.9987C17.5 15.4407 17.3244 15.8646 17.0118 16.1772C16.6993 16.4898 16.2754 16.6654 15.8333 16.6654H10C9.55797 16.6654 9.13405 16.4898 8.82149 16.1772C8.50893 15.8646 8.33333 15.4407 8.33333 14.9987V13.332M12.5 9.9987H2.5M5 12.4987L2.5 9.9987L5 7.4987" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                   <p className={activeTab === "logout" ? "text-strong" : "text-sub group-hover:text-strong"}>Logout</p>
                   </div>

                  </div>

                 </div>
            </div>

            <div className="w-full h-full flex flex-col items-center">
              <div className="w-full shrink-0 h-[56px] border-b border-line-sub pr-[18px] items-center flex justify-end">
               <div onClick={closeSettings} className="w-[20px] h-[20px] items-center flex justify-center cursor-pointer"> <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg></div>
              </div>



{/* 
.........................................PAGES.............................................................. */}






              <div className="w-full flex-1 min-h-0 overflow-y-auto no-scrollbar pt-[32px]  justify-center items-start flex">
                {activeTab === "account" && (
                  <div className="w-full max-w-[840px]  flex flex-col gap-[32px]">
                   

                   {/* .........TopBar......... */}
                  <div className="p-[4px] w-full flex flex-col  border border-line-sub bg-surface-alpha-light-soft rounded-[20px] overflow-hidden">
                   <div className="w-full p-[16px] items-center flex justify-start"><p className="text-label-sm text-sub">Personal details</p></div>
                   <div className="flex w-full p-[24px] gap-[24px] bg-surface-alpha-light-soft border border-line-sub rounded-[16px] flex-col">

                    <div className="pb-[24px] w-full  flex flex-row border-b border-line-sub ">

                      <div className="flex flex-col w-[400px] gap-[10px] pb-[10px] ">
                        <p className="text-label-sm text-sub">Profile photo</p>
                        <p className="text-paragraph-sm text-soft">PNG or JPG, up to 20 MB.</p>
                      </div>

                       <div className="flex flex-1 flex-row  w-full justify-between">
                        <div className="w-[60px] h-[60px] rounded-full overflow-hidden">
                          <Image src={profileImage ?? profile} alt="prifileicon" width={100} height={100} unoptimized className="w-full h-full object-cover"/>
                        </div>
                        <div className="py-[12px]  flex flex-row gap-[12px] items-center">
                         <input ref={photoInputRef} type="file" accept="image/png, image/jpeg" onChange={handlePhotoSelected} className="hidden" />
                         <button onClick={() => photoInputRef.current?.click()} className="s-btn-noicon-36 text-label-sm text-strong items-center flex justify-center  transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px cursor-pointer"><p className="px-[4px]">{profileImage ? "Change photo" : "Upload photo"}</p></button>
                         <button onClick={handleRemovePhoto} className="removedisabled text-label-sm text-strong items-center flex justify-center cursor-pointer" disabled={!profileImage}>Remove</button>
                        </div>
                      </div>
 
                    </div>

                    <div className="w-full  pb-[24px] border-b border-line-sub">
                    <div className="flex flex-row h-[36px] ">
                      <p className="w-[400px] shrink-0 items-center text-label-sm text-sub  py-[8px]">Full name</p>
                      <div className=" flex flex-row items-center gap-[12px] w-full">
                        <div className="rounded-[10px] w-full h-full items-center flex text-paragraph-sm overflow-hidden transition-colors duration-200 ease-out border border-line-strong focus-within:border-line-white">
                          <input
                            type="text"
                            placeholder="Aqib Javed"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="px-[12px] py-[16px] text-paragraph-sm w-full border-none bg-surface-alpha-light-soft outline-none text-strong"
                          />
                        </div>
                        <button onClick={handleSaveName} className="s-btn-noicon-36  text-label-sm text-strong items-center flex justify-center  transition-colors duration-200 ease-out cursor-pointer " disabled={isSaveDisabled}><p className="px-[4px]">Save</p></button>
                      </div>
                    </div>
                    </div>

                    <div className="w-full  h-[36px] flex flex-row items-center">
                      <p className="w-[400px] shrink-0 items-center text-label-sm text-sub  py-[8px]">Email address</p>
                      <p className="text-sub text-paragraph-sm w-full">aqibbismillah@gmail.com</p>
                    </div>

                   </div>
                  </div>
                  
                  {/* ........Bottombar...... */}
                  <div className="p-[4px] bg-surface-alpha-light-soft rounded-[20px] border border-line-sub ">
                    <div className="p-[16px] ">
                      <p className="text-label-sm text-sub">Delete account</p>
                    </div>
                    <div className="p-[24px]  border rounded-[16px] bg-surface-alpha-light-soft border-line-sub flex flex-row items-center justify-between">
                      <p className="text-paragraph-sm text-sub">Permanently delete your account, images and remaining credits.</p>
                      <button onClick={() => setIsDeleteConfirmOpen(true)} className="h-[36px] rounded-[8px] bg-semantic-red-alpha-25 hover:bg-semantic-red-alpha-15 px-[12px] py-[8px] items-center flex justify-center text-label-sm text-semantic-red-400 transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px cursor-pointer">Delete account</button>
                    </div>


                  </div>

                  </div>
                )}

                {activeTab === "billing" && (
                  <div className="w-full max-w-[840px] pb-[60px] flex flex-col gap-[20px]"> 
                  {billingData ? (
                    <>
                    {/* .......topDiv....... */}
                      <div className="w-full bg-surface-alpha-light-soft p-[4px] border border-line-sub rounded-[20px] overflow-hidden flex flex-col">
                       <div className="w-full px-[16px] pb-[16px] pt-[12px] flex flex-row items-center gap-[8px] ">
                         <p className=" text-label-sm text-sub">Current plan</p>
                         <button className="px-[6px] py-[2px] bg-semantic-green-alpha-25 text-semantic-green-200 rounded-[6px] flex items-center justify-center text-label-xs">Active</button>
                       </div>

                       <div className="px-[24px] w-full pt-[24px] pb-[16px] bg-surface-alpha-light-soft rounded-[16px] border border-line-sub gap-[32px] flex flex-col ">
                        {PLAN_DETAILS.map((row) => (
                          <div key={row.label} className="flex flex-col w-full gap-[24px]">
                            <div className="w-full flex flex-row items-center">
                              <p className="w-[210px] h-full text-paragraph-sm text-sub ">{row.label}</p>
                              {row.value}
                            </div>
                          </div>
                        ))}
                        {/* ..........................bootombtnbar......................... */}
                        <div className="w-full  pt-[24px] border-t border-line-sub flex items-end justify-end">
                          <button className="p-btn-noicon-32 text-label-sm flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px cursor-pointer"><p className="px-[4px]">Manage billing</p></button>
                        </div>
                       </div>

                      </div>

                     {/* ...........CenterDiv......... */}
                     <div className="w-full bg-surface-alpha-light-soft border border-line-sub p-[4px] rounded-[20px] flex overflow-hidden flex-col">
                      <div className="w-full  pt-[12px] pb-[16px] px-[16px] flex items-center">
                        <p className="text-label-sm text-sub">Payment method</p>
                      </div>
                      <div className="p-[24px] w-full bg-surface-alpha-light-soft rounded-[16px] border border-line-sub flex flex-row items-center justify-between">
                      <div className="flex flex-row gap-[12px] items-center justify-center">
                      
                      
                    <svg  width="32" height="24" viewBox="0 0 32 24" fill="none">
                     <rect width="32" height="24" rx="4" fill="#1B39C3"/>
                     <path d="M26.222 15.9115L25.997 14.7434H23.483L23.083 15.9032L21.068 15.9073C22.0273 13.5122 22.9886 11.1179 23.952 8.72449C24.116 8.31853 24.407 8.11191 24.836 8.11399C25.164 8.1171 25.699 8.1171 26.442 8.11502L28 15.9084L26.222 15.9115ZM24.049 13.1434H25.669L25.064 10.2155L24.049 13.1434ZM11.06 8.11295L13.086 8.11502L9.954 15.9125L7.903 15.9104C7.38725 13.8508 6.87791 11.7895 6.375 9.72644C6.275 9.31528 6.077 9.02767 5.696 8.89166C5.357 8.77018 4.792 8.58329 4 8.32891V8.11606H7.237C7.797 8.11606 8.124 8.39744 8.229 8.97472C8.335 9.55304 8.601 11.0253 9.029 13.3916L11.06 8.11295ZM15.87 8.11502L14.268 15.9104L12.34 15.9084L13.94 8.11295L15.87 8.11502ZM19.78 7.9707C20.357 7.9707 21.084 8.15759 21.502 8.32891L21.164 9.94551C20.786 9.7877 20.164 9.57485 19.641 9.58212C18.881 9.59561 18.411 9.92682 18.411 10.2445C18.411 10.7616 19.227 11.0222 20.067 11.587C21.026 12.2308 21.152 12.8091 21.14 13.4373C21.127 14.7413 20.067 16.0278 17.831 16.0278C16.811 16.0122 16.443 15.9229 15.611 15.6166L15.963 13.9294C16.81 14.298 17.169 14.4153 17.893 14.4153C18.556 14.4153 19.125 14.1371 19.13 13.6522C19.134 13.3075 18.93 13.1362 18.186 12.7105C17.442 12.2837 16.398 11.6929 16.412 10.5072C16.429 8.98926 17.814 7.9707 19.781 7.9707H19.78Z" fill="white"/>
                    </svg>
                      <p className="text-paragraph-sm text-strong">Visa card ending in 4242</p>
                      </div>
                      <p className="underline underline-offset-[3.40px] text-label-sm text-sub cursor-pointer hover:text-strong transition-colors duration-100 ease-out">Change card</p>
                      </div>
                     </div>

                      {/* .........BottomDiv........ */}
                    <div className="w-full bg-surface-alpha-light-soft border border-line-sub p-[4px] rounded-[20px] flex overflow-hidden flex-col">
                      <div className="w-full pt-[12px] pb-[16px] px-[16px] flex items-center">
                        <p className="text-label-sm text-sub">Billing history</p>
                      </div>
                      <div className="py-[8px] w-full bg-surface-alpha-light-soft border border-line-sub rounded-[16px] flex flex-col  gap-[16px]">
                        {/* Header row */}
                        <div className="grid grid-cols-[1.4fr_1fr_1fr_0.7fr_0.7fr] gap-[16px] px-[24px] pb-[8px] items-center  border-b border-line-sub">
                          <p className="text-subheading-xs text-soft uppercase  ">Date</p>
                          <p className="text-subheading-xs text-soft uppercase ">Plan</p>
                          <p className="text-subheading-xs text-soft uppercase ">Status</p>
                          <p className="text-label-sm text-sub">Amount</p>
                          <p className="text-label-sm text-sub">Actions</p>
                        </div>

                        {/* Rows */}
                        {BILLING_HISTORY.map((row, index) => (
                          <div
                            key={row.date}
                            className={`grid grid-cols-[1.4fr_1fr_1fr_0.7fr_0.7fr] gap-[16px] px-[24px] items-center ${
                              index !== BILLING_HISTORY.length - 1 ? "pb-[16px]  border-b border-line-sub" : "pb-[16px] "
                            }`}
                          >
                            <p className="text-paragraph-sm text-sub">{row.date}</p>
                            <p className="text-paragraph-sm text-strong">{row.plan}</p>
                            <span className="px-[6px] py-[2px] w-fit rounded-[6px] bg-semantic-green-alpha-25 text-semantic-green-200 text-label-xs">{row.status}</span>
                            <p className="text-label-sm text-strong">{row.amount}</p>
                            <p className="text-label-sm text-sub underline underline-offset-[2px] cursor-pointer hover:text-strong transition-colors duration-100 ease-out">View</p>
                          </div>
                        ))}
                      </div>
                     </div>
                    </>
                  ) : (
                         <>
                          {/* .......topDiv....... */}
                      <div className="w-full bg-surface-alpha-light-soft p-[4px] rounded-[20px] border border-line-sub overflow-hidden flex flex-col">
                        <p className="px-[16px] pb-[16px] pt-[12px] text-label-sm text-sub">Current plan</p>
                        <div className="px-[24px] h-[200px] w-full rounded-[16px] border border-line-sub bg-surface-alpha-light-soft flex items-center justify-center gap-[24px] flex-col">
                          <div className="w-full flex flex-col gap-[8px] items-center justify-center">
                            <p className="text-paragraph-sm text-sub">No active plans</p>
                            <p className="text-paragraph-xs text-soft">Choose a plan and start creating</p>
                          </div>
                          <button className="p-btn-noicon-32 text-label-sm flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px cursor-pointer"><p className="px-[4px]">View plans</p></button>
                        </div>
                      </div>

                      {/* .........BottomDiv........ */}
                      <div className="w-full bg-surface-alpha-light-soft p-[4px] rounded-[20px] border border-line-sub overflow-hidden flex flex-col">
                           <p className="px-[16px] pb-[16px] pt-[12px]  text-label-sm text-sub">Billing history</p>
                        <div className="px-[24px] h-[200px] w-full rounded-[16px] border border-line-sub bg-surface-alpha-light-soft  flex items-center justify-center gap-[24px] flex-col">
                          <div className="w-full flex flex-col gap-[8px] items-center justify-center">
                            <p className="text-paragraph-sm text-sub">No billing history yet</p>
                            <p className="text-paragraph-xs text-soft">Your payments and invoices will appear here</p>
                          </div>
                        </div>
                      </div>
                         </>
                  )}
                  </div>
                )}

                {activeTab === "usage" && (
                  <div className="w-full max-w-[840px]  pb-[32px]  flex flex-col gap-[32px]">
                    {usagedata?(
                      <>
                          {/* .........UserHasData....... */}
                      {/* .........TopPart....... */}
                      <div className="flex flex-col w-full gap-[12px]">
                        {/* .........TopPart....... */}
                        <div className="w-full bg-surface-alpha-light-soft rounded-[16px] border border-line-sub overflow-hidden flex flex-col p-[4px]">
                          <div className=" px-[16px] pb-[16px] pt-[12px] flex w-full items-center">
                            <p className="text-paragraph-sm text-sub">Credit breakdown</p>
                          </div>
                          <div className="w-full  rounded-[12px] border border-line-sub px-[16px] pb-[24px] pt-[20px] gap-[24px] flex flex-col">

                           <div className="pb-[20px] w-full border-b border-line-sub">
                            <div className="w-[242px] flex flex-row items-center justify-between">
                              <p className="text-paragraph-sm text-sub">Available credits</p>
                              <p className="text-label-lg text-strong">104</p>
                            </div>
                           </div>
                       
                          <div className="w-full flex flex-col gap-[20px] ">
                            {/* .............PlanCredits............. */}
                            <div className="w-full flex flex-row ">
                              <div className="w-[210px]  flex flex-row items-center gap-[4px]">
                                <p className="text-paragraph-sm text-sub">Plan credits</p>
                                <InfoTooltip text="Credits included in your plan and added each month" />
                              </div>
                              <div className="flex flex-row gap-[12px]">
                               <div className="flex flex-row  w-[120px] "> 
                                <p className="text-paragraph-sm text-strong">68</p>
                                <p className="text-paragraph-sm text-sub">/80</p>
                               </div>
                                <p className="text-paragraph-sm text-sub">Expires Nov 12, 2026</p>
                              </div>
                            </div>
                               {/* .............RollerCredits............. */}
                              <div className="w-full  flex flex-row">
                              <div className="w-[210px] flex flex-row items-center gap-[4px]">
                                <p className="text-paragraph-sm text-sub">Rolled-over credits</p>
                                <InfoTooltip text="Unused plan credits from previous months. Valid for 90 days." />
                              </div>
                                <div className="flex flex-row gap-[12px]">  
                                <p className="text-paragraph-sm   w-[120px]  text-strong">24</p>
                                <p className="text-paragraph-sm text-sub">Expires Oct 12, 2026</p>
                              </div>
                            </div>
                               {/* .............FreeCredits............. */}
                              <div className="w-full flex flex-row">
                              <div className="w-[210px] flex flex-row items-center gap-[4px]">
                                <p className="text-paragraph-sm text-sub">Free credits</p>
                                <InfoTooltip text="Credits received through a free trial or promotion." />
                              </div>
                                   <div className="flex flex-row ">  
                                <p className="text-paragraph-sm   w-[120px]  text-sub">0</p>                             
                              </div>
                            </div>
                               {/* .............TopUpCredits............. */}
                              <div className="w-full flex flex-row">
                              <div className="w-[210px] flex flex-row items-center gap-[4px]">
                                <p className="text-paragraph-sm text-sub">Top-up credits</p>
                                <InfoTooltip text="Extra credits purchased separately. Valid for 12 months." />
                              </div>
                                 <div className="flex flex-row gap-[12px]">  
                                <p className="text-paragraph-sm   w-[120px]  text-strong">12</p>
                                <p className="text-paragraph-sm text-sub">Expires Aug 21, 2027</p>
                              </div>
                           
                            </div>
                          </div>

                          </div>

                        </div>
                        {/* .........BottomBtnPart....... */}
                        <div className={`w-full flex items-center px-[16px] ${isAnnualPlan ? "justify-between" : "justify-end"}`}>
                          {isAnnualPlan && (
                            <div className="flex flex-row gap-[8px] items-center">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                               <path d="M8 6H8.00667M7.33333 8H8V10.6667H8.66667M2 8C2 8.78793 2.15519 9.56815 2.45672 10.2961C2.75825 11.0241 3.20021 11.6855 3.75736 12.2426C4.31451 12.7998 4.97595 13.2418 5.7039 13.5433C6.43185 13.8448 7.21207 14 8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2418 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2418 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 6.4087 13.3679 4.88258 12.2426 3.75736C11.1174 2.63214 9.5913 2 8 2C6.4087 2 4.88258 2.63214 3.75736 3.75736C2.63214 4.88258 2 6.4087 2 8Z" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <p className="text-paragraph-xs text-sub">Your next 80 plan credits will be added on Sep 14, 2026.</p>
                            </div>
                          )}
                          <button onClick={() => setIsExtraCreditsOpen(true)} className="p-btn-noicon-32 flex items-center justify-center transition-all duration-200 ease-out cursor-pointer active:scale-[0.98] active:translate-y-px"><p className="px-[4px] text-label-sm">Buy extra credits</p></button>
                        </div>
                      </div>

                      {/* .........BottomPart....... */}
                        <div className="w-full bg-surface-alpha-light-soft rounded-[16px] border border-line-sub overflow-hidden flex flex-col p-[4px]">
                          <div className=" px-[16px] pb-[16px] pt-[12px] flex w-full items-center">
                            <p className="text-paragraph-sm text-sub">Usage history</p>
                          </div>
                          <div className="w-full bg-surface-alpha-light-soft rounded-[12px] border border-line-sub  py-[8px] gap-[16px] flex flex-col">
                            {/* Header row */}
                            <div className="grid grid-cols-[1.3fr_0.7fr_1fr_1fr_1.1fr] gap-[16px] items-center pb-[8px] px-[24px] border-b border-line-sub">
                              <p className="text-subheading-xs text-soft uppercase ">Date</p>
                              <p className="text-subheading-xs text-soft uppercase ">Image</p>
                              <p className="text-subheading-xs text-soft uppercase">Type</p>
                              <p className="text-subheading-xs text-soft uppercase ">Status</p>
                              <p className="text-label-sm text-sub">Credits</p>
                            </div>

                            {/* Rows */}
                            {USAGE_HISTORY.map((row, index) => (
                              <div
                                key={index}
                                className={`grid grid-cols-[1.3fr_0.7fr_1fr_1fr_1.1fr] gap-[16px] items-center pb-[16px] px-[24px] ${
                                  index !== USAGE_HISTORY.length - 1 ? " border-b border-line-sub" : ""
                                }`}
                              >
                                <p className="text-paragraph-sm text-sub">{row.date}</p>
                                {row.image ? (
                                  <div className="w-[32px] h-[32px] rounded-[6px] overflow-hidden">
                                    <Image src={row.image} alt={row.type} width={80} height={80} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-[32px] h-[32px] rounded-[6px] bg-semantic-red-alpha-25 flex items-center justify-center">
                                   <svg  width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3.79948 3.79948L12.1995 12.1995M2 8C2 8.78793 2.15519 9.56815 2.45672 10.2961C2.75825 11.0241 3.20021 11.6855 3.75736 12.2426C4.31451 12.7998 4.97595 13.2418 5.7039 13.5433C6.43185 13.8448 7.21207 14 8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2418 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2418 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 7.21207 13.8448 6.43185 13.5433 5.7039C13.2418 4.97595 12.7998 4.31451 12.2426 3.75736C11.6855 3.20021 11.0241 2.75825 10.2961 2.45672C9.56815 2.15519 8.78793 2 8 2C7.21207 2 6.43185 2.15519 5.7039 2.45672C4.97595 2.75825 4.31451 3.20021 3.75736 3.75736C3.20021 4.31451 2.75825 4.97595 2.45672 5.7039C2.15519 6.43185 2 7.21207 2 8Z" stroke="#FDB5B4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                   </svg>
                                  </div>
                                )}
                                <p className="text-paragraph-sm text-strong">{row.type}</p>
                                <span
                                  className={`px-[6px] py-[2px] w-fit rounded-[6px] text-label-xs flex items-center justify-center ${
                                    row.status === "Completed" ? "bg-semantic-green-alpha-25 text-semantic-green-200" : "bg-semantic-red-alpha-25 text-semantic-red-200"
                                  }`}
                                >
                                  {row.status}
                                </span>
                                <p className="text-paragraph-sm text-sub">{row.credits}</p>
                              </div>
                            ))}
                          </div>

                        </div>
                      </>
                    ):(
                      <>
                      {/* .........UserIsFirst WithNoData....... */}
                      {/* .........TopPart....... */}
                      <div className="flex flex-col w-full gap-[12px]">
                        {/* .........TopPart....... */}
                        <div className="w-full bg-surface-alpha-light-soft rounded-[16px] border border-line-sub overflow-hidden flex flex-col p-[4px]">
                          <div className=" px-[16px] pb-[16px] pt-[12px] flex w-full items-center">
                            <p className="text-paragraph-sm text-sub">Credit breakdown</p>
                          </div>
                          <div className="w-full bg-surface-alpha-light-soft rounded-[12px] border border-line-sub px-[16px] pb-[24px] pt-[20px] gap-[24px] flex flex-col">

                           <div className="pb-[20px] w-full border-b border-line-sub">
                            <div className="w-[222px] flex flex-row items-center justify-between">
                              <p className="text-paragraph-sm text-sub">Available credits</p>
                              <p className="text-label-lg text-sub">0</p>
                            </div>
                           </div>
                       
                          <div className="w-full flex flex-col gap-[20px] ">
                            {/* .............PlanCredits............. */}
                            <div className="w-full flex flex-row">
                              <div className="w-[210px] flex flex-row items-center gap-[4px]">
                                <p className="text-paragraph-sm text-sub">Plan credits</p>
                                <InfoTooltip text="Credits included in your plan and added each month" />
                              </div>
                              <p className="text-paragraph-sm text-sub">0</p>
                            </div>
                               {/* .............RollerCredits............. */}
                              <div className="w-full  flex flex-row">
                              <div className="w-[210px] flex flex-row items-center gap-[4px]">
                                <p className="text-paragraph-sm text-sub">Rolled-over credits</p>
                                <InfoTooltip text="Unused plan credits from previous months. Valid for 90 days." />
                              </div>
                              <p className="text-paragraph-sm text-sub">0</p>
                            </div>
                               {/* .............FreeCredits............. */}
                              <div className="w-full flex flex-row">
                              <div className="w-[210px] flex flex-row items-center gap-[4px]">
                                <p className="text-paragraph-sm text-sub">Free credits</p>
                                <InfoTooltip text="Credits received through a free trial or promotion." />
                              </div>
                              <p className="text-paragraph-sm text-sub">0</p>
                            </div>
                               {/* .............TopUpCredits............. */}
                              <div className="w-full flex flex-row">
                              <div className="w-[210px] flex flex-row items-center gap-[4px]">
                                <p className="text-paragraph-sm text-sub">Top-up credits</p>
                                <InfoTooltip text="Extra credits purchased separately. Valid for 12 months." />
                              </div>
                              <p className="text-paragraph-sm text-sub">0</p>
                            </div>
                          </div>

                          </div>

                        </div>
                        {/* .........BottomBtnPart....... */}
                        <div className="w-full  flex justify-end px-[16px]">
                          <button className="p-btn-noicon-32 flex items-center justify-center transition-all duration-200 ease-out cursor-pointer active:scale-[0.98] active:translate-y-px"><p className="px-[4px] text-label-sm">View plans</p></button>
                        </div>
                      </div>

                      {/* .........BottomPart....... */}
                        <div className="w-full bg-surface-alpha-light-soft rounded-[16px] border border-line-sub overflow-hidden flex flex-col p-[4px]">
                          <div className=" px-[16px] pb-[16px] pt-[12px] flex w-full items-center">
                            <p className="text-paragraph-sm text-sub">Usage history</p>
                          </div>
                          <div className="w-full bg-surface-alpha-light-soft rounded-[12px] border border-line-sub px-[24px]  gap-[8px] flex flex-col items-center justify-center h-[200px]">
                           <p className="text-paragraph-sm text-sub">No usage yet</p>
                           <p className="text-paragraph-xs text-soft">Your generated images and credit activity will appear here.</p>
                          </div>

                        </div>
                      </>
                    )

                    }
                  </div>
                
                )}

                {activeTab === "logout" && (
                  <div className="p-[24px]">
                    <p className="text-label-lg text-strong">Logout</p>
                    <p className="text-paragraph-sm text-sub mt-[8px]">Logout options will go here.</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Simple pop in/out confirm dialog — same plain pattern as
        FeedbackModal/PricingModal (no motion/AnimatePresence), just a
        backdrop div with outside-click-to-close and a stopPropagation
        card inside it. */}
    {isDeleteConfirmOpen && (
      <div
        onClick={() => setIsDeleteConfirmOpen(false)}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black-90"
      >
       {/* ..................Modal..................... */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-weak w-full max-w-[550px] rounded-[16px] p-[24px] border border-line-sub flex flex-col gap-[24px]"
        >
          {/* .........Top Section bar ......... */}
          <div className="w-full pb-[24px] border-b border-line-sub flex flex-row items-center justify-between">
            <p className="text-label-lg text-strong">Delete your account?</p>
            <div onClick={()=>setIsDeleteConfirmOpen(false)} className="w-[24px] h-[24px] cursor-pointer flex items-center justify-center">
              <svg  width="16" height="16" viewBox="0 0 16 16" fill="none">
               <path d="M12 4L4 12M4 4L12 12" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {/* .............CenterAuthPart.......... */}
          <div className="w-full  flex flex-col gap-[32px]">
            <div className="w-full  flex flex-col gap-[24px]">
              <p className="text-paragraph-sm text-sub">This action permanently deletes your account, generated images, gallery items, saved preferences and remaining credits. It cannot be undone.</p>

              <div className="w-full  flex flex-col gap-[12px]">
                <div className="flex flex-row gap-[12px]  w-full items-start">
                  <div className="w-[20px] h-[20px] shrink-0  flex items-center justify-center">
                    <div
                      onClick={() => setKeepImagesConfirmed((v) => !v)}
                      className="w-[14px] h-[14px] rounded-[2px] border-strong border-[1.5px] flex items-center justify-center cursor-pointer"
                    >
                      {keepImagesConfirmed && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-sub">
                          <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-paragraph-sm text-strong ">I have downloaded any image i want to keep.</p>
                </div>

                  <div className="flex flex-row gap-[12px]  w-full items-start">
                  <div className="w-[20px] h-[20px] shrink-0  flex items-center justify-center">
                    <div
                      onClick={() => setUnderstandPermanentConfirmed((v) => !v)}
                      className="w-[14px] h-[14px] rounded-[2px] border-strong border-[1.5px] flex items-center justify-center cursor-pointer"
                    >
                      {understandPermanentConfirmed && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-sub">
                          <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                     <p className="text-paragraph-sm text-strong ">I understand that my account data and remaining credits will be permanently deleted.</p>
                </div>
                
              </div>

              <div className="w-full  flex flex-col gap-[10px]">
               
                  <p className="text-label-sm text-sub">Type your email address to confirm</p>
                  <div className={`rounded-[10px] w-full h-[46px] items-center flex text-paragraph-sm overflow-hidden transition-colors duration-200 ${isEmailAutofilled ? "border border-line-white" : "border border-line-strong focus-within:border-line-white"}`}>
                    <input
                      type="text"
                      placeholder="example@email.com"
                      value={deleteConfirmEmail}
                      onChange={(e) => { setDeleteConfirmEmail(e.target.value); setIsEmailAutofilled(false); }}
                      onAnimationStart={(e) => {
                        if (e.animationName === "onAutofillDetect") {
                          if (e.currentTarget.value !== deleteConfirmEmail) {
                            setDeleteConfirmEmail(e.currentTarget.value);
                          }
                          setIsEmailAutofilled(true);
                        }
                      }}
                      className={`px-[12px] py-[16px] text-paragraph-sm w-full ${isEmailAutofilled || isEmailFilled ? "text-strong" : "text-soft"} border-none hover:bg-surface-alpha-light-soft focus:hover:bg-transparent focus:text-white outline-none autofill:bg-transparent placeholder:text-paragraph-sm placeholder:text-sub`}
                    />
                  </div>

              </div>
            </div>
            <div></div>
          </div>
    
         {/* .........bottomDeleteBar....... */}
          <div className="flex flex-row justify-end gap-[12px]">
             <button onClick={() => setIsDeleteConfirmOpen(false)} className="s-btn-noicon-36  items-center flex justify-center text-label-sm  transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px cursor-pointer">
            <p className="px-[4px]">Keep my account</p>
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={!isDeleteValid}
              className={`text-label-sm px-[12px] py-[8px] transition-all duration-200 ease-out rounded-[8px] items-center flex justify-center ${
                isDeleteValid
                  ? "bg-semantic-red-alpha-25 hover:bg-semantic-red-alpha-15 active:scale-[0.98] text-semantic-red-400 cursor-pointer"
                  : "bg-surface-soft text-disabled cursor-not-allowed"
              }`}
            >
             Permanently delete account
            </button>
           
          </div>
        </div>

      </div>
    )}

    {/* "Buy extra credits" dialog — same simple pop in/out pattern as the
        delete-confirm dialog: full-screen bg-black-90 overlay (z-[65], above
        the delete dialog's z-[60]) with a smaller centered card, while the
        Settings backdrop behind it dims to bg-black-40 (see
        isExtraCreditsOpen in the backdrop className above). Dummy colors —
        shell only, no design/content given yet. */}
    {isExtraCreditsOpen && (
      <div
        onClick={() => setIsExtraCreditsOpen(false)}
        className="fixed inset-0 z-[65] bg-black-90 flex items-center justify-center"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-weak w-full max-w-[917px] rounded-[24px] border border-line-sub p-[24px] flex flex-col gap-[24px]"
        >
          <div className="w-full flex flex-row justify-between">
           <div className="flex flex-col w-full gap-[12px]">
            <p className="text-label-lg text-strong">Buy extra credits</p>
            <p className="text-paragraph-sm text-sub">Add credits to your plan. One-time purchase, valid for 12 months.</p>
           </div>
            <div onClick={() => setIsExtraCreditsOpen(false)} className="w-[24px] h-[24px] cursor-pointer flex items-center justify-center">
             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
            </div>
          </div>
            {/* ............Cards............ */}
          <div className="w-full h-[350px] flex flex-row gap-[12px]">
         {/* ..........Card1........... */}
            <div className="p-[20px] w-full  flex flex-col bg-surface-alpha-light-weak  rounded-[16px] border border-line-sub items-center justify-between">
              <div className="pb-[24px] flex flex-col gap-[80px] w-full items-center  ">
                <div className="flex flex-col w-full gap-[12px] items-center">
                 <div className="px-[8px] py-[2px] bg-surface-alpha-light-white text-label-xs h-[24px] items-center justify-center flex text-strong rounded-[6px]">20 credits</div>
                 <p className="text-paragraph-sm text-sub">$0.95 per credit</p>
                </div>
                <p className="text-strong text-title-h3">$19</p>
              </div>
             <button className="p-btn-noicon-36 flex items-center justify-center text-label-sm  w-full">Buy 20 credits</button>
            </div>
               
          {/* ..........Card2........... */}
               <div className="p-[20px] w-full  flex flex-col bg-surface-alpha-light-weak  rounded-[16px] border border-line-sub items-center justify-between">
              <div className="pb-[24px] flex flex-col gap-[80px] w-full items-center  ">
                <div className="flex flex-col w-full gap-[12px] items-center">
                 <div className="px-[8px] py-[2px] bg-surface-alpha-light-white text-label-xs h-[24px] items-center justify-center flex text-strong rounded-[6px]">60 credits</div>
                 <p className="text-paragraph-sm text-sub">$0.82 per credit</p>
                </div>
                <p className="text-strong text-title-h3">$49</p>
              </div>
             <button className="p-btn-noicon-36 flex items-center justify-center text-label-sm  w-full">Buy 60 credits</button>
            </div>
          {/* ..........Card3........... */}
               <div className="p-[20px] w-full bg-surface-alpha-light-weak flex flex-col rounded-[16px] border border-line-sub items-center justify-between">
              <div className="pb-[24px] flex flex-col gap-[80px] w-full items-center  ">
                <div className="flex flex-col w-full gap-[12px] items-center">
                 <div className="px-[8px] py-[2px] bg-surface-alpha-light-white text-label-xs h-[24px] items-center justify-center flex text-strong rounded-[6px]">150 credits</div>
                 <p className="text-paragraph-sm text-sub">$0.73 per credit</p>
                </div>
                <p className="text-strong text-title-h3">$109</p>
              </div>
             <button className="p-btn-noicon-36 flex items-center justify-center text-label-sm w-full">Buy 150 credits</button>
            </div>

          </div>
          
           {/* ............BottomArea............ */}
          <div className="w-full pt-[8px] flex items-center justify-center">
            <div className="flex flex-row gap-[6px]">
              <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
               <g clip-path="url(#clip0_1164_25708)">
                 <rect x="3.96875" y="8.53516" width="12.0605" height="9.16514" rx="1.66667" stroke="#6F7073" stroke-width="1.2" stroke-linejoin="round"/>
                 <path d="M13.3346 9.16667V5.83333C13.3346 3.99238 11.8423 2.5 10.0013 2.5C8.16035 2.5 6.66797 3.99238 6.66797 5.83333V9.16667" stroke="#6F7073" stroke-width="1.2" stroke-linejoin="round"/>
                 <line opacity="0.9" x1="9.98672" y1="12.8344" x2="9.98672" y2="13.7177" stroke="#6F7073" stroke-width="1.2" stroke-linecap="round"/>
               </g>
               <defs>
               <clipPath id="clip0_1164_25708">
                 <rect width="20" height="20" fill="white"/>
               </clipPath>
               </defs>
              </svg>
              <p className="text-paragraph-sm text-soft">Secure checkout via Polar</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default SettingsModal;
