"use client";
// ......MobileGenerateHome........//
// Idle/start state of the Generate page, mobile-only — same image + copy as
// the desktop idle state in app/generate/page.tsx, kept as its own
// component so it can be styled independently for mobile later.
import { useState } from 'react';
import Image from 'next/image';
import modalimg from '@/public/mobilemodalimg.svg';
import MobileGenerateFlow from './MobileGenerateFlow';

export default function MobileGenerateHome() {
  const [flowOpen, setFlowOpen] = useState(false);

  function handleActivate() {
    setFlowOpen(true);
  }

  return (
    <div className='flex md:hidden w-full h-full items-center justify-center bg-neutral-900'>
      <div className='relative w-full h-[493px] items-center  flex mb-[80px] justify-center '>
        <Image src={modalimg} alt="Model shot preview" fill className='object-cover scale-[0.90] overflow-visible'  />

        <div className='absolute -bottom-[44px] flex flex-col items-center justify-center gap-[20px]'>
          <div className='flex flex-col items-center justify-center gap-[8px]'>
            <p className='text-label-lg text-strong'>Create your model shot</p>
            <p className='text-center text-sub text-paragraph-sm'>Select your options from the right to <br /> create your shot.</p>
          </div>
          <button
            onClick={handleActivate}
            onPointerUp={(e) => {
              if (e.pointerType === 'touch') {
                e.preventDefault();
                handleActivate();
              }
            }}
            className='p-btn-noicon-48 text-label-sm origin-center transform-gpu will-change-transform [backface-visibility:hidden] transition-transform duration-150 ease-out active:scale-[0.98] flex items-center justify-center'
          >
            <p className='px-[4px] '>Generate now</p>
          </button>
        </div>
      </div>

      {flowOpen && <MobileGenerateFlow onClose={() => setFlowOpen(false)} />}
    </div>
  );
}
