"use client";
// ......LogoutConfirmDialog........//
// Shared "are you sure?" logout dialog — same simple pop in/out pattern
// used by SettingsModal's own delete-confirm dialog, just far shorter:
// logging out isn't destructive, so there's no typed confirmation or
// checkboxes, just a plain Cancel / Log out choice. Used from both
// SettingsModal.tsx (Settings sidebar) and profiledropdown.tsx (navbar).
//
// Rendered via a portal straight into <body> — profiledropdown.tsx nests
// this inside navbar's own animated (Framer Motion) wrapper, and any
// ancestor with a `transform` (which Framer applies even at rest) becomes
// the containing block for `position: fixed` descendants. Without the
// portal, this dialog's `fixed inset-0` centers within that small dropdown
// box instead of the actual viewport.
import { createPortal } from "react-dom";

export default function LogoutConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black-90"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-weak w-full max-w-[400px] rounded-[16px] p-[24px] border border-line-sub flex flex-col gap-[24px]"
      >
        <div className="w-full flex flex-row items-start justify-between">
          <div className="flex flex-col gap-[8px]">
            <p className="text-label-lg text-strong">Log out of Foldrise?</p>
            <p className="text-paragraph-sm text-sub">You&apos;ll need to sign in again to access your account.</p>
          </div>
          <div onClick={onCancel} className="w-[24px] h-[24px] cursor-pointer flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex flex-row justify-end gap-[12px]">
          <button onClick={onCancel} className="s-btn-noicon-36 items-center flex justify-center text-label-sm transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px cursor-pointer">
            <p className="px-[4px]">Cancel</p>
          </button>
          <button onClick={onConfirm} className="p-btn-noicon-36 items-center flex justify-center text-label-sm transition-all duration-200 ease-out active:scale-[0.98] active:translate-y-px cursor-pointer">
            <p className="px-[4px]">Log out</p>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
