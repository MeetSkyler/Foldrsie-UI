import { useEffect, useState } from "react";
import { motion } from "motion/react";
import img1 from '@/public/img1.jpg'
import img3 from '@/public/img3.jpg'
import img4 from '@/public/img4.jpg'
import img5 from '@/public/img5.jpg'
import Image from 'next/image';
import LoginPortion from "./loginPortion";
import VerifyPortion from "./verifyPortion";

const SLIDE_DURATION = 3000;

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<"login" | "verify">("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const images=[
    img1,img3,img4,img5
  ];
  const slides = [...images, images[0]]; // clone of the first image at the end for a seamless loop
  const [position, setPosition] = useState(0); // physical slide position, can briefly go one past the last real image
  const [instant, setInstant] = useState(false); // disables animation for the invisible loop-reset snap
  const activeimg = position % images.length;

  useEffect(()=>{
    const timer=setInterval(()=>{
      setPosition((prev)=>prev+1);
    },SLIDE_DURATION);
    return()=>clearInterval(timer);
  },[position]);

  useEffect(()=>{
    if(!instant) return;
    const raf = requestAnimationFrame(()=>setInstant(false));
    return()=>cancelAnimationFrame(raf);
  },[instant]);

  function goTo(i: number){
    setInstant(false);
    setPosition(i);
  }

  return (
    <div className=" bg-surface-weak flex flex-row  w-[1018px] h-[687px] rounded-[24px] overflow-hidden">

    {/* ImageBlock */}
    <div className="bg-surface-weak w-full h-full p-[12px] ">
      <div className="w-full h-full relative rounded-[16px] flex flex-row items-center justify-center overflow-hidden" style={{ transform: "translateZ(0)" }}>
        <motion.div className="w-full h-full inset-0 flex flex-row"
         animate={{ x: `-${position*100}%` }}
         transition={instant ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
         onAnimationComplete={() => {
           if (position === images.length) {
             setInstant(true);
             setPosition(0);
           }
         }}>
           {slides.map((img,i)=>{
        return(
        <Image key={i} src={img} alt="images" unoptimized priority={i===0} className="w-full h-full shrink-0 object-cover bg-center"/>
        )
      })}
        </motion.div>
        {/* Lined dIv */}
        <div  className="absolute w-[175px] h-[4px] flex items-center justify-center flex-row gap-[4px] bottom-[24px] ">
          {images.map((img,i)=>{
            const isPast=i<activeimg;
            const isActive=i===activeimg;
            return(
              <div key={i} onClick={() => goTo(i)} className="relative h-full w-full cursor-pointer rounded-[10px] overflow-hidden bg-white-40">
                {isPast && <div className="absolute inset-0 bg-white-40" />}
                {isActive && (
                  <motion.div
                    key={position}
                    className="absolute inset-y-0 left-0 bg-white rounded-[10px]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: SLIDE_DURATION / 1000,
                      ease: "linear",
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>

    {/* loginForm */}
    <div className="bg-surface-weak relative h-full w-full py-[24px]">
         {step === "login" && (
           <LoginPortion onContinue={(email) => { setPendingEmail(email); setStep("verify"); }} />
         )}
         {step === "verify" && (
           <VerifyPortion email={pendingEmail} onBack={() => setStep("login")} onSuccess={onSuccess} />
         )}
    </div>

    </div>
  );
}
