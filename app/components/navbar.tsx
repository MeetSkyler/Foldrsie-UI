"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import profile from '@/public/profile.svg'
import Image from 'next/image';
import { useAuthModal } from "@/app/context/auth-modal-context";
import { usePricingModal } from "@/app/context/pricing-modal-context";
import Profiledrop from '@/app/components/profiledropdown'

const Navbar = () => {
  const [isusernew, setisusernew] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const { openLogin } = useAuthModal();
  const { openPricing } = usePricingModal();

  useEffect(() => {
    if (!isProfileOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsProfileOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  return (
    <div className="w-full h-[60px] border-b border-line-sub pr-[16px] items-center flex justify-end py-[14px] bg-surface-weak">
      {isusernew ? 
      (<>
      {/* ....Pricing Link ..... */}
      <div className="flex flex-row pr-[20px] h-full items-center gap-[20px]  ">
             <button onClick={openPricing} className=" flex items-center text-paragraph-sm text-sub  hover:text-strong cursor-pointer">Pricing</button>
        <div className="bg-white-12 w-px h-[12px]"></div>
      </div>

      {/* .......Login and Try for Free...... */}
      <div className="flex flex-row h-full gap-[12px]">
      <button onClick={openLogin} className=" text-label-sm s-btn-noicon-32 flex items-center cursor-pointer justify-center ">
        Login
      </button>

       <Link href="" className="p-btn-noicon-32  text-label-sm  flex items-center justify-center">
       Try for free
       </Link>
      </div>
      </> )
      
      // ......................................If Not A New User .....................................
      
      
      : (
        <>
      {/* ....Pricing Link ..... */}
      <div className="flex flex-row pr-[20px] h-full items-center gap-[20px] ">
             <button onClick={openPricing} className=" flex items-center text-paragraph-sm text-sub hover:text-strong cursor-pointer">Pricing</button>
        <div className="bg-white-12 w-px h-[12px]"></div>
      </div>

      {/* .......Login and Try for Free...... */}
      <div ref={profileRef} className="flex h-full relative ">
       <button onClick={() => setIsProfileOpen((v) => !v)} className="relative flex items-center justify-center cursor-pointer">
       <Image src={profile.src} alt="Foldrise Profile Icon" width={100} height={100} className="inset-0 w-full h-full" />
       </button>
       <AnimatePresence>
         {isProfileOpen && (
           <motion.div
             initial={{ opacity: 0, y: -8, scale: 0.96 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -8, scale: 0.96 }}
             transition={{ duration: 0.15, ease: "easeOut" }}
             // Animating opacity/transform makes this div its own stacking
             // context — without an explicit z-index here, that context
             // sorts by DOM order against the sidebar's own z-30 instead of
             // beating it outright, so mid-animation it can briefly render
             // *behind* the sidebar until the transform settles. z-40 keeps
             // it on top for the whole animation, not just at rest.
             className="relative z-40"
             // Positioned so it doesn't fight Profiledrop's own absolute
             // top/right — Profiledrop still finds this `relative` div as
             // its positioning parent since this wrapper adds no position
             // of its own.
             style={{ transformOrigin: "top right" }}
           >
             <Profiledrop/>
           </motion.div>
         )}
       </AnimatePresence>
      </div>
      </>
      )}
    </div>
  );
};

export default Navbar;


