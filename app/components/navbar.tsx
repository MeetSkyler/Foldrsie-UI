"use client";
import Link from "next/link";
import { useState } from "react";
import profile from '@/public/profile.svg'
import Image from 'next/image';
import { useAuthModal } from "@/app/context/auth-modal-context";

const Navbar = () => {
  const [isusernew, setisusernew] = useState(true);
  const { openLogin } = useAuthModal();

  return (
    <div className="w-full h-[60px] border-b border-line-sub pr-[16px] items-center flex justify-end py-[14px] bg-surface-weak">
      {isusernew ? 
      (<>
      {/* ....Pricing Link ..... */}
      <div className="flex flex-row pr-[20px] h-full items-center gap-[20px]  ">
             <Link href="" className=" flex items-center text-paragraph-sm text-sub  hover:text-strong">Pricing</Link>
        <div className="bg-white-12 w-px h-[12px]"></div>
      </div>

      {/* .......Login and Try for Free...... */}
      <div className="flex flex-row h-full gap-[12px]">
      <button onClick={openLogin} className=" text-label-sm s-btn-noicon-32 flex items-center justify-center bg-green-400">
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
             <Link href="" className=" flex items-center text-paragraph-sm text-sub hover:text-strong">Pricing</Link>
        <div className="bg-white-12 w-px h-[12px]"></div>
      </div>

      {/* .......Login and Try for Free...... */}
      <div className="flex h-full">
       <Link href="" className="relative flex items-center justify-center">
       <Image src={profile.src} alt="Foldrise Profile Icon" width={100} height={100} className="inset-0 w-full h-full" />
       </Link>
      </div>
      </> 
      )}
    </div>
  );
};

export default Navbar;


