"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthModal } from "@/app/context/auth-modal-context";
import { LoginForm } from "./login-form";
import SuccessPortion from "./successPortion";
import img1 from "@/public/img1.jpg";
import img3 from "@/public/img3.jpg";
import img4 from "@/public/img4.jpg";
import img5 from "@/public/img5.jpg";

const carouselImages = [img1, img3, img4, img5];

export function LoginModal() {
  const { isLoginOpen, closeLogin } = useAuthModal();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isLoginOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLogin();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoginOpen, closeLogin]);

  useEffect(() => {
    if (!isLoginOpen) setShowSuccess(false);
  }, [isLoginOpen]);

  return (
    <>
      {/* Invisible warm-up: forces Next.js to preload/optimize these images on app load,
          so they're already cached by the time the modal is first opened. */}
      <div aria-hidden className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none -z-10">
        {carouselImages.map((img, i) => (
          <Image key={i} src={img} alt="" unoptimized priority />
        ))}
      </div>

      {isLoginOpen && (
        <div
          onClick={closeLogin}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black-90"
        >
          <div onClick={(e) => e.stopPropagation()}>
            {showSuccess ? (
              <SuccessPortion />
            ) : (
              <LoginForm onSuccess={() => setShowSuccess(true)} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
