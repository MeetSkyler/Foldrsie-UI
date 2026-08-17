"use client";
import { useEffect, useState } from "react";
import { useFeedbackModal } from "@/app/context/feedback-modal-context";

const FEEDBACK_TYPES = ["General", "Feature request", "Report an issue"];

const FeedbackModal = () => {
  const { isFeedbackOpen, closeFeedback } = useFeedbackModal();
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState("");

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

  return (
    <div
      onClick={closeFeedback}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-80"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-weak w-[600px] rounded-[24px] p-[24px] flex flex-col gap-[24px]"
      >
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-[4px]">
            <p className="text-title-h6 text-strong">Share feedback</p>
            <p className="text-paragraph-sm text-sub">Tell us what&apos;s working, what&apos;s confusing, or what we can improve.</p>
          </div>
          <div
            onClick={closeFeedback}
            className="w-[32px] h-[32px] rounded-full bg-surface-light flex items-center justify-center text-strong cursor-pointer shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-[10px]">
          <p className="text-label-sm text-strong">Feedback type</p>
          <div className="flex flex-row gap-[8px]">
            {FEEDBACK_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-[14px] py-[8px] rounded-[999px] text-label-sm cursor-pointer ${
                  type === t ? "bg-white text-darker" : "bg-surface-light text-sub hover:text-strong"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[10px]">
          <p className="text-label-sm text-strong">Tell us more</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share what happened, what you were trying to do, or what you'd like to see."
            className="w-full h-[160px] rounded-[12px] bg-surface-soft border border-line-strong focus-within:border-line-white p-[12px] text-paragraph-sm text-strong placeholder:text-soft outline-none resize-none"
          />
        </div>

        <div className="flex flex-row items-center justify-end gap-[12px]">
          <button
            onClick={closeFeedback}
            className="px-[16px] py-[10px] rounded-[10px] bg-surface-light text-label-sm text-strong cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-[16px] py-[10px] rounded-[10px] bg-white text-label-sm text-darker cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
