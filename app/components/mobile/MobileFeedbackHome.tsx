"use client";
// ......MobileFeedbackHome........//
// Mobile counterpart of FeedbackModal.tsx — same feedback types, message
// field, and "no backend yet" send behavior, laid out as a full routed page
// (mobile nav links straight to /feedback) instead of a centered overlay.
import { useState } from "react";
import Spinner from "@/app/components/Spinner";

const FEEDBACK_TYPES = ["General", "Feature request", "Report an issue"];

export default function MobileFeedbackHome() {
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSend() {
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    // No backend yet — simulate a brief send before confirming.
    setTimeout(() => {
      setStatus("sent");
      setType(FEEDBACK_TYPES[0]);
      setMessage("");
    }, 900);
  }

  function handleMessageChange(value: string) {
    setMessage(value);
    if (status === "sent") setStatus("idle");
  }

  return (
    <div className="flex md:hidden flex-col w-full h-full overflow-y-auto no-scrollbar bg-surface-dark px-[16px] pt-[24px] pb-[24px] gap-[32px]">
      <div className="flex flex-col gap-[8px]">
        <p className="text-label-lg text-strong">Share feedback</p>
        <p className="text-paragraph-sm text-sub">Tell us what&apos;s working, what&apos;s confusing, or what we can improve.</p>
      </div>

      <div className="flex flex-col gap-[16px]">
        <p className="text-label-sm text-strong">Feedback type</p>
        <div className="flex flex-row flex-wrap gap-[8px]">
          {FEEDBACK_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-[12px] py-[8px] rounded-[8px] border cursor-pointer text-label-sm ${
                type === t ? "bg-surface-light text-strong border-surface-light" : "text-sub border-line-strong"
              }`}
            >
              <p>{t}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[16px]">
        <p className="text-label-sm text-strong">Tell us more</p>
        <div className="rounded-[12px] h-[182px] w-full overflow-hidden border border-line-strong focus-within:border-line-white">
          <textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Share what happened, what you were trying to do, or what you'd like to see."
            className={`w-full h-[182px] p-[12px] text-paragraph-sm ${
              message.length > 0 ? "text-strong" : "text-soft"
            } border-none outline-none resize-none`}
          />
        </div>
      </div>

      {status === "sent" && <p className="text-label-sm text-strong">Thanks! Your feedback was sent.</p>}

      <button
        onClick={handleSend}
        disabled={!message.trim() || status === "sending"}
        className="p-btn-noicon-48 text-label-sm flex items-center justify-center gap-[8px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "sending" && <Spinner size={16} />}
        <p className="px-[4px]">{status === "sending" ? "Sending..." : "Send feedback"}</p>
      </button>
    </div>
  );
}
