"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSettingsModal } from "@/app/context/settings-modal-context";
import Image from 'next/image';
import profile from '@/public/Profilesimple.svg'

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

const SettingsModal = () => {
  const { isSettingsOpen, closeSettings } = useSettingsModal();
  const [isTopHovered, setIsTopHovered] = useState(false);
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
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          key="settings-backdrop"
          onClick={closeSettings}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-black-90 flex flex-col justify-end items-center pt-[46px]"
        >
          {/* Hovering this top strip of exposed backdrop hints that it closes
              the modal, and nudges the panel down a touch so the hint reads
              as "this black area belongs to the backdrop, not the panel." */}
          <div
            onMouseEnter={() => setIsTopHovered(true)}
            onMouseLeave={() => setIsTopHovered(false)}
            className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-center"
          >
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
              upward from the bottom instead of just fading/scaling in. */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ height: 0 }}
            animate={{ height: isTopHovered ? "calc(100% - 24px)" : "100%" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-surface-weak w-full rounded-tr-[24px] rounded-tl-[24px] overflow-hidden border border-line-sub flex flex-row"
          >
     
            <div className="w-[230px]  h-full flex flex-col items-center border-r border-line-sub">
                 <div className="w-full h-[57px] shrink-0 px-[24px] py-[16px] text-label-lg text-strong border-b border-line-sub">Settings</div>
                 <div className="w-full h-full  flex flex-col justify-between">

                  {/* .........toplinks........... */}
                  <div className="flex flex-col gap-[8px] w-full  px-[24px] pt-[24px]">
                    {SETTINGS_TABS.map((tab)=>{
                      const isActive = activeTab === tab.id;
                      return(
                           <div
                             key={tab.id}
                             onClick={() => setActiveTab(tab.id)}
                             className={`w-full px-[10px] py-[8px] cursor-pointer group flex items-center gap-[8px] rounded-[10px] ${isActive ? "bg-surface-soft" : " hover:bg-surface-alpha-light-soft"}`}
                           >
                            <i className={`shrink-0 ${isActive ? "text-strong" : "text-sub group-hover:text-strong"}`}>{tab.icon}</i>
                            <p className={`text-paragraph-sm ${isActive ? "text-strong" : "text-sub group-hover:text-strong"}`}>{tab.label}</p>
                           </div>
                    )
                    })
                  }
                  </div>

                  {/* .............bottomlinks......... */}
                  <div className="w-full pb-[16px] px-[24px] ">
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
              <div className="w-full shrink-0 h-[57px] border-b border-line-sub pr-[18px] items-center flex justify-end">
               <div onClick={closeSettings} className="w-[20px] h-[20px] items-center flex justify-center cursor-pointer"> <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg></div>
              </div>



{/* 
.........................................PAGES.............................................................. */}






              <div className="w-full h-fit overflow-y-auto pt-[32px]  justify-center flex">
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
                          <Image src={profileImage ?? profile} alt="prifileicon" width={100} height={100} unoptimized={!!profileImage} className="w-full h-full object-cover"/>
                        </div>
                        <div className="py-[12px]  flex flex-row gap-[12px] items-center">
                         <input ref={photoInputRef} type="file" accept="image/png, image/jpeg" onChange={handlePhotoSelected} className="hidden" />
                         <button onClick={() => photoInputRef.current?.click()} className="s-btn-noicon-36 text-label-sm text-strong items-center flex justify-center"><p className="px-[4px]">Upload photo</p></button>
                         <button onClick={handleRemovePhoto} className="s-btn-noicon-36  text-label-sm text-strong items-center flex justify-center" disabled={!profileImage}><p className="px-[4px]">Remove</p></button>
                        </div>
                      </div>
 
                    </div>

                    <div className="w-full  pb-[24px] border-b border-line-sub">
                    <div className="flex flex-row h-[36px] ">
                      <p className="w-[400px] shrink-0 items-center text-label-sm text-sub  py-[8px]">Full name</p>
                      <div className=" flex flex-row items-center gap-[12px] w-full">
                        <div className="rounded-[10px] w-full h-full items-center flex text-paragraph-sm overflow-hidden transition-colors duration-200 border border-line-strong focus-within:border-line-white">
                          <input
                            type="text"
                            placeholder="Aqib Javed"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="px-[12px] py-[16px] text-paragraph-sm w-full border-none bg-surface-alpha-light-soft outline-none text-strong"
                          />
                        </div>
                        <button onClick={handleSaveName} className="s-btn-noicon-36  text-label-sm text-strong items-center flex justify-center" disabled={isSaveDisabled}><p className="px-[4px]">Save</p></button>
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
                    <div className="p-[24px]  border rounded-[16px] border-line-sub flex flex-row items-center justify-between">
                      <p className="text-paragraph-sm text-sub">Permanently delete your account, images and remaining credits.</p>
                      <button className="h-[36px] rounded-[8px] bg-semantic-red-alpha-25 px-[12px] py-[8px] items-center flex justify-center text-label-sm text-semantic-red-400">Delete account</button>
                    </div>


                  </div>

                  </div>
                )}





                {activeTab === "billing" && (
                  <div className="p-[24px]">
                    <p className="text-label-lg text-strong">Billing</p>
                    <p className="text-paragraph-sm text-sub mt-[8px]">Billing details will go here.</p>
                  </div>
                )}

                {activeTab === "usage" && (
                  <div className="p-[24px]">
                    <p className="text-label-lg text-strong">Usage</p>
                    <p className="text-paragraph-sm text-sub mt-[8px]">Usage stats will go here.</p>
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
  );
};

export default SettingsModal;
