import { useEffect, useRef, useState } from "react";
import { useAuthModal } from "@/app/context/auth-modal-context";
import Link from 'next/link';


const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 3;
const DEMO_VALID_CODE = "123456"; // placeholder until this is wired up to a real verification API

const verifyPortion = ({ email, onBack, onSuccess }: { email: string; onBack: () => void; onSuccess: () => void }) => {
  const { closeLogin } = useAuthModal();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [showErrorBorder, setShowErrorBorder] = useState(false); // clears as soon as the user starts a new attempt, independent of the error message
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const isLocked = attemptsLeft <= 0;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function submitCode(fullCode: string) {
    if (fullCode === DEMO_VALID_CODE) {
      onSuccess();
      return;
    }
    setAttemptsLeft((a) => a - 1);
    setStatus("error");
    setShowErrorBorder(true);
    setCode(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  }

  function handleDigitChange(index: number, value: string) {
    if (isLocked) return;
    const digit = value.replace(/\D/g, "").slice(-1);
    if (digit) setShowErrorBorder(false);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    if (digit && index === 5) {
      const fullCode = next.join("");
      if (fullCode.length === 6) {
        submitCode(fullCode);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    if (isLocked) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = pasted.split("");
    while (next.length < 6) next.push("");
    setCode(next);
    const lastIndex = Math.min(pasted.length, 6) - 1;
    inputsRef.current[lastIndex]?.focus();
    if (pasted.length === 6) {
      submitCode(pasted);
    }
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setAttemptsLeft(MAX_ATTEMPTS);
    setStatus("idle");
    setShowErrorBorder(false);
    setCode(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  }

  return (
    <div className="w-full h-full bg-surface-weak flex flex-col items-center">
      {/* TopCrossIcon */}
      <div className="bg-surface-weak w-full h-[173.5px] flex justify-between items-start px-[24px]">
        <div
          onClick={onBack}
          className="w-[32px] h-[32px] rounded-full text-strong items-center flex bg-surface-light justify-center aspect-square cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div
          onClick={closeLogin}
          className="w-[32px] h-[32px] rounded-full text-strong bg-surface-light items-center flex justify-center aspect-square  cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* centerMainpart */}
      <div className="flex-1 w-full h-full py-[10px] px-[48.5px] py-[10px] flex bg-surface-weak flex-col justify-center gap-[16px]">

        <div className="flex flex-col gap-[20px] w-full items-center text-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="white"/>
          <path d="M8.94141 30.1932H10.2274C13.4097 30.1932 15.0008 30.1932 16.3112 29.4367C17.6216 28.6801 18.4172 27.3022 20.0083 24.5462L22.9049 19.5293" stroke="#101214" strokeWidth="3.29412" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M26.5878 8.47168C26.5878 8.47168 26.8215 10.6528 27.7317 11.5631C28.642 12.4733 30.8231 12.707 30.8231 12.707C30.8231 12.707 28.642 12.9407 27.7317 13.8509C26.8215 14.7611 26.5878 16.9423 26.5878 16.9423C26.5878 16.9423 26.3541 14.7611 25.4439 13.8509C24.5337 12.9407 22.3525 12.707 22.3525 12.707C22.3525 12.707 24.5337 12.4733 25.4439 11.5631C26.3542 10.6528 26.5878 8.47168 26.5878 8.47168Z" fill="#101214" stroke="#101214" strokeWidth="0.705882" strokeLinejoin="round"/>
        </svg>
          <p className="text-strong text-title-h5">Check your email</p>
        </div>

        <div className="w-full h-full flex flex-col gap-[44px]">
          <p className="text-paragraph-sm text-sub w-full text-center flex items-center justify-center">Enter the code sent to <span className="text-strong ml-[4px] mb-[1px] text-paragraph-sm">{email}</span></p>
         <div className="flex flex-col w-full gap-[20px]">

           <div className="w-full flex flex-row  h-[60px] justify-center">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                disabled={isLocked}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-full h-full text-center flex-1 text-paragraph-md items-center flex justify-center first:rounded-l-xl last:rounded-r-xl  text-[#FFFFFF] border ${
                  showErrorBorder ? "border-red-500" : digit ? "border-line-white" : "border-surface-soft"
                } focus:border-line-white outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {status === "error" && (
            <p className="text-label-xs text-red-500 w-full text-center">
              {isLocked
                ? "Too many incorrect attempts. Please resend a new code."
                : `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`}
            </p>
          )}

          <div className="w-full flex flex-row items-center justify-center gap-[8px]">
            <p className="text-paragraph-sm text-sub">Didn&apos;t receive a code?</p>
            {secondsLeft > 0 ? (
              <p className="text-paragraph-sm text-sub">Resend ({secondsLeft})</p>
            ) : (
              <p onClick={handleResend} className="text-paragraph-sm text-strong cursor-pointer underline underline-offset-2">Resend again</p>
            )}
          </div>
         </div>
        </div>

      </div>

      {/* Bottomtext */}
        <div className='flex-1 w-full h-full flex items-end justify-center'>
       <p className='text-label-xs text-sub'> By continuing, you agree to our <span> <Link href="/" className='underline  underline-offset-3'>Terms of Service</Link></span> and
        <span> <Link href="/" className='underline underline-offset-3'>Privacy Policy</Link></span></p>
      </div>
    </div>
  );
};

export default verifyPortion;
