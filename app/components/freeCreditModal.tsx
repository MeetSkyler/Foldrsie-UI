"use client";
import { useEffect } from "react";
import { useFreeCreditModal } from "@/app/context/free-credit-modal-context";
import Image from 'next/image';
import giftcredit from '@/public/gift.png'
          

const freeCreditModal = () => {
  const { isFreeCreditOpen, closeFreeCredit } = useFreeCreditModal();

  useEffect(() => {
    if (!isFreeCreditOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") closeFreeCredit();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFreeCreditOpen, closeFreeCredit]);

  if (!isFreeCreditOpen) return null;

  return (
    <div
      onClick={closeFreeCredit}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-90"
    >
      <div onClick={(e) => e.stopPropagation()} className=" h-[521px] gap-[32px] px-[95px] rounded-[24px] flex flex-col items-center justify-center"
        style={{background:"linear-gradient(180deg, var(--color-neutral-700, #212325) 0%, rgba(15, 17, 19, 0.00) 100%), var(--color-neutral-800, #16171A)"}}>
        <div className="w-[200] h-[178px] items-center relative justify-center flex">
          <Image src={giftcredit} alt="CreditGift" width={100} height={100} className="object-cover w-full -ml-[9px] h-full" />
        </div>
        <div className="gap-[12px] flex flex-col items-center justify-center">
           <p className="text-center text-title-h5 text-strong">We’ve added 10 free <br /> credits to your account</p>
           <div className="flex w-full flex-col gap-[24px] items-center justify-center">
           <p className="text-paragraph-sm text-sub w-full">Try Foldrise and create your first model shot for free</p>
           <button onClick={closeFreeCredit} className="flex items-center justify-center w-full h-[48px] text-darker text-label-sm p-btn-noicon-48">Claim Credits</button>
           </div>
        </div>
     
      </div>
    </div>
  );
};

export default freeCreditModal;