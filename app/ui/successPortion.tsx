import { useState } from "react";
import { useAuthModal } from "@/app/context/auth-modal-context";

const successPortion = () => {
  const { closeLogin } = useAuthModal();
  const [name, setname] = useState("");
  const [status, setstatus] = useState("idle"); // "idle" | "error"
  const [isautofilled, setisautofilled] = useState(false); // true right after browser autofill/paste-suggestion
  const isfilled = name.length > 0;

  function handleNameChange(value: string) {
    // typecheck: strip anything that isn't a letter or space, so only a name can ever be entered
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
    setname(lettersOnly);
    setstatus("idle");
    setisautofilled(false);
  }

  function handleContinueWithName() {
    const isValidName = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(name.trim());
    if (!isValidName) {
      setstatus("error");
      return;
    }
    closeLogin();
  }

  return (
    <div className="bg-surface-weak flex items-center justify-center  w-[1018px] h-[687px] rounded-[24px] overflow-hidden">
    <div className="w-full bg-surface-weak px-[309px] flex flex-col gap-[44px] justify-center">
      <div className="flex flex-col gap-[20px] items-center justify-center w-full">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
         <rect width="40" height="40" rx="10" fill="white"/>
         <path d="M8.94141 30.1932H10.2274C13.4097 30.1932 15.0008 30.1932 16.3112 29.4367C17.6216 28.6801 18.4172 27.3022 20.0083 24.5462L22.9049 19.5293" stroke="#101214" strokeWidth="3.29412" strokeLinecap="round" strokeLinejoin="round"/>
         <path d="M26.5878 8.47168C26.5878 8.47168 26.8215 10.6528 27.7317 11.5631C28.642 12.4733 30.8231 12.707 30.8231 12.707C30.8231 12.707 28.642 12.9407 27.7317 13.8509C26.8215 14.7611 26.5878 16.9423 26.5878 16.9423C26.5878 16.9423 26.3541 14.7611 25.4439 13.8509C24.5337 12.9407 22.3525 12.707 22.3525 12.707C22.3525 12.707 24.5337 12.4733 25.4439 11.5631C26.3542 10.6528 26.5878 8.47168 26.5878 8.47168Z" fill="#101214" stroke="#101214" strokeWidth="0.705882" strokeLinejoin="round"/>
        </svg>
        <p className="text-title-h5 text-strong">What&apos;s your full name?</p>
      </div>
      <div className="flex flex-col gap-[20px]">
        <div className="flex flex-col gap-[10px]">
          <p className={`w-full text-label-sm ${status === "error" ? "text-[#EF4444]" : "text-sub"}`}>Full name</p>

          <form onSubmit={(e) => { e.preventDefault(); handleContinueWithName(); }} className={`bg-surface-weak rounded-[12px] w-full h-[48px] items-center flex text-paragraph-sm overflow-hidden transition-colors duration-200 ${
            status === "error" ? "border border-red-500" :
            isautofilled ? "border border-line-white" :
            "border border-line-strong focus-within:border-line-white"
          }`}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onAnimationStart={(e) => {
                if (e.animationName === "onAutofillDetect") {
                  if (e.currentTarget.value !== name) {
                    handleNameChange(e.currentTarget.value);
                  }
                  setisautofilled(true);
                }
              }}
              className={`px-[12px] py-[16px] text-paragraph-sm w-full ${isautofilled || isfilled ? "text-strong" : "text-soft"} border-none hover:bg-surface-alpha-light-soft focus:hover:bg-surface-weak focus:text-white outline-none autofill:bg-surface-weak`}
            />
          </form>
          {status === "error" && (
            <p className="text-label-xs text-red-500">Please enter your full name</p>
          )}
        </div>
        <button onClick={handleContinueWithName} disabled={!name} className="text-label-sm cursor-pointer p-btn-noicon-48 flex items-center justify-center shrink-0">
          <p>Continue</p>
        </button>
      </div>

    </div>
    </div>
  );
};

export default successPortion;
