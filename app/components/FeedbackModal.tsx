"use client";
import { useEffect, useState } from "react";
import { useFeedbackModal } from "@/app/context/feedback-modal-context";

const FEEDBACK_TYPES = ["General", "Feature request", "Report an issue"];

const FeedbackModal = () => {
  const { isFeedbackOpen, closeFeedback } = useFeedbackModal();
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState("");
  // Same autofill/paste-suggestion detection as the login email input (see
  // globals.css's onAutofillDetect keyframe, now also scoped to textarea).
  const [isAutofilled, setIsAutofilled] = useState(false);
  const isFilled = message.length > 0;

  useEffect(() => {
    if (!isFeedbackOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeFeedback();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFeedbackOpen, closeFeedback]);

  useEffect(() => {
    if (!isFeedbackOpen) {
      setType(FEEDBACK_TYPES[0]);
      setMessage("");
    }
  }, [isFeedbackOpen]);

  if (!isFeedbackOpen) return null;

  function handleSend() {
    if (!message.trim()) return;
    // No backend yet — just close and reset like a successful submit.
    closeFeedback();
  }

  function handleMessageChange(value: string) {
    setMessage(value);
    setIsAutofilled(false);
  }

  return (
    <div
      // Deliberately no onClick here — the backdrop must not close the
      // modal; only the cross icon or the Cancel button should.
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-90"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-weak w-[700px] rounded-[24px] p-[24px] border border-line-sub flex flex-col gap-[24px]"
      >
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-[8px]">
            <p className="text-label-lg text-strong">Share feedback</p>
            <p className="text-paragraph-sm text-sub">Tell us what&apos;s working, what&apos;s confusing, or what we can improve.</p>
          </div>
          <div
            onClick={closeFeedback}
            className="w-[24px] h-[24px]  flex items-center justify-center cursor-pointer shrink-0"
          >
            <svg  width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-sub">
             <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="flex flex-col  gap-[16px]">
          <p className="text-label-sm text-strong">Feedback type</p>
          <div className="flex flex-row gap-[8px]">
            {FEEDBACK_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-[12px] py-[8px] rounded-[8px] cursor-pointer ${
                  type === t ? "bg-surface-light text-strong border border-surface-light text-label-sm" : " text-sub text-paragraph-sm hover:text-strong hover:border-surface-light border border-line-strong"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <p className="text-label-sm text-strong">Tell us more</p>
          <div
            className={`rounded-[12px] h-[182px] w-full overflow-hidden transition-colors duration-200 border ${
              isAutofilled ? "border-line-white" : "border-line-strong focus-within:border-line-white"
            }`}
          >
            <textarea
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              onAnimationStart={(e) => {
                if (e.animationName === "onAutofillDetect") {
                  if (e.currentTarget.value !== message) {
                    handleMessageChange(e.currentTarget.value);
                  }
                  setIsAutofilled(true);
                }
              }}
              placeholder="Share what happened, what you were trying to do, or what you'd like to see."
              className={`w-full h-[182px] p-[12px] text-paragraph-sm ${
                isAutofilled || isFilled ? "text-strong" : "text-soft"
              } border-none hover:bg-surface-alpha-light-soft focus:hover:bg-surface-weak focus:text-white outline-none resize-none autofill:bg-surface-soft`}
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-end gap-[12px]">
          <button
            onClick={closeFeedback}
            className="s-btn-noicon-36 text-label-sm  cursor-pointer"
          >
           <p className="px-[4px]"> Cancel</p>
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-btn-noicon-36 text-label-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <p className="px-[4px]">Send feedback</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
