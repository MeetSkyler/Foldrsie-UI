"use client";
// ......MobileSettingsHome........//
// Mobile counterpart of SettingsModal.tsx — same tabs (My account/Billing/
// Usage), same dummy data shape and interactions (edit name, upload photo,
// delete account, logout, buy extra credits), laid out as a routed page
// (mobile nav links straight to /settings) with a top pill-tab row instead
// of desktop's left sidebar, and stacked cards instead of desktop's
// multi-column tables.
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuthModal } from "@/app/context/auth-modal-context";
import profile from "@/public/Profilesimple.svg";
import { useImageDragDrop } from "@/app/hooks/useImageDragDrop";
import usageThumb1 from "@/public/img1.jpg";
import usageThumb2 from "@/public/img4.jpg";

const SETTINGS_TABS = [
  { id: "account", label: "My account" },
  { id: "billing", label: "Billing" },
  { id: "usage", label: "Usage" },
] as const;

const PLAN_DETAILS = [
  { label: "Plan", value: "Growth (Billed monthly)" },
  { label: "Monthly charge", value: "$49/month" },
  { label: "Included credits", value: "80 image credits each month" },
  { label: "Billing period", value: "Aug 14, 2026 – Sep 14, 2026" },
  { label: "Renewal date", value: "Sep 19, 2026" },
];

const BILLING_HISTORY = [
  { date: "July 28, 2026", plan: "Starter", status: "Paid", amount: "$9" },
  { date: "August 15, 2026", plan: "40 credits", status: "Paid", amount: "$15" },
  { date: "September 10, 2026", plan: "30 credits", status: "Paid", amount: "$12" },
];

const USAGE_HISTORY = [
  { date: "Aug 24, 11:31 AM", image: usageThumb1, type: "Standard 2K", status: "Completed", credits: "-1 credit" },
  { date: "Aug 24", image: null, type: "Standard 2K", status: "Failed", credits: "+1 credit returned" },
  { date: "Aug 24", image: usageThumb2, type: "Special 4K", status: "Completed", credits: "-2 credits" },
];

const CREDIT_ROWS = [
  { label: "Plan credits", value: "68/80", note: "Expires Nov 12, 2026" },
  { label: "Rolled-over credits", value: "24", note: "Expires Oct 12, 2026" },
  { label: "Free credits", value: "0", note: "" },
  { label: "Top-up credits", value: "12", note: "Expires Aug 21, 2027" },
];

const CREDIT_PACKS = [
  { credits: 20, perCredit: "$0.95 per credit", price: "$19" },
  { credits: 60, perCredit: "$0.82 per credit", price: "$49" },
  { credits: 150, perCredit: "$0.73 per credit", price: "$109" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col gap-[4px]">
      <p className="text-label-sm text-sub">{label}</p>
      <div className="text-paragraph-sm text-strong">{children}</div>
    </div>
  );
}

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-surface-alpha-light-soft p-[4px] border border-line-sub rounded-[20px] overflow-hidden flex flex-col">
      <div className="w-full px-[16px] pb-[16px] pt-[12px]">
        <p className="text-label-sm text-sub">{title}</p>
      </div>
      <div className="px-[16px] py-[20px] bg-surface-alpha-light-soft rounded-[16px] border border-line-sub flex flex-col gap-[20px]">
        {children}
      </div>
    </div>
  );
}

const TAB_IDS = SETTINGS_TABS.map((t) => t.id);

export default function MobileSettingsHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openLogin } = useAuthModal();
  // MobileProfileSheet (the mobile top bar's signed-in profile sheet) links
  // straight here with ?tab=billing etc — this is a routed page, not a
  // modal reading shared context like desktop's SettingsModal, so the
  // initial tab travels via the URL instead.
  const requestedTab = searchParams.get("tab");
  const initialTab = TAB_IDS.includes(requestedTab as (typeof TAB_IDS)[number]) ? (requestedTab as (typeof SETTINGS_TABS)[number]["id"]) : "account";
  const [activeTab, setActiveTab] = useState<(typeof SETTINGS_TABS)[number]["id"]>(initialTab);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isExtraCreditsOpen, setIsExtraCreditsOpen] = useState(false);
  // Same dummy "has data vs. empty" toggles as SettingsModal.tsx (desktop) —
  // kept in sync so both platforms preview the same states off the same
  // on/off switch instead of mobile only ever showing the populated view.
  const [billingData, setBillingData] = useState(false);
  const [usagedata, setUsagedata] = useState(true);

  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [keepImagesConfirmed, setKeepImagesConfirmed] = useState(false);
  const [understandPermanentConfirmed, setUnderstandPermanentConfirmed] = useState(false);
  const ACCOUNT_EMAIL = "aqibbismillah@gmail.com";
  const isDeleteValid = keepImagesConfirmed && understandPermanentConfirmed && deleteConfirmEmail.trim().toLowerCase() === ACCOUNT_EMAIL;

  const [savedName, setSavedName] = useState("Aqib Javed");
  const [fullName, setFullName] = useState(savedName);
  const isSaveDisabled = fullName.trim() === "" || fullName === savedName;

  function handleSaveName() {
    if (isSaveDisabled) return;
    setSavedName(fullName.trim());
    setFullName(fullName.trim());
  }

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  function applyPhotoFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    applyPhotoFile(file);
  }

  // Same as applyPhotoFile, for an image dragged in from a webpage instead
  // of a local file — see useImageDragDrop's onUrl for why there's no File here.
  function applyPhotoUrl(url: string) {
    setProfileImage(url);
  }

  // No hover highlight here — a hover-style highlight doesn't make sense on
  // a touch screen, but a trackpad-in-mobile-viewport drop still works.
  const photoDragDrop = useImageDragDrop(applyPhotoFile, applyPhotoUrl);

  function handleRemovePhoto() {
    setProfileImage(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function handleConfirmLogout() {
    setIsLogoutConfirmOpen(false);
    openLogin();
  }

  function closeDeleteConfirm() {
    setIsDeleteConfirmOpen(false);
    setDeleteConfirmEmail("");
    setKeepImagesConfirmed(false);
    setUnderstandPermanentConfirmed(false);
  }

  return (
    <div className="flex md:hidden flex-col w-full h-full overflow-y-auto no-scrollbar bg-surface-dark px-[16px] pt-[24px] pb-[24px] gap-[24px]">
      <p className="text-label-lg text-strong">Settings</p>

      {/* .......Tab selector........ */}
      <div className="p-[2px] w-full border border-line-sub bg-surface-alpha-light-soft rounded-[12px] flex flex-row">
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-[8px] py-[8px] rounded-[10px] flex items-center justify-center cursor-pointer text-label-sm ${
                isActive ? "bg-surface-alpha-light-white text-strong" : "text-soft"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "account" && (
        <div className="w-full flex flex-col gap-[16px]">
          <div className="w-full bg-surface-alpha-light-soft p-[4px] border border-line-sub rounded-[20px] overflow-hidden flex flex-col">
            <div className="w-full p-[16px]"><p className="text-label-sm text-sub">Personal details</p></div>
            <div className="flex w-full p-[16px] gap-[20px] bg-surface-alpha-light-soft border border-line-sub rounded-[16px] flex-col">
              <div className="pb-[20px] w-full flex flex-col gap-[12px] border-b border-line-sub">
                <p className="text-label-sm text-sub">Profile photo</p>
                <div className="flex flex-row items-center justify-between">
                  <div
                    onDragOver={photoDragDrop.onDragOver}
                    onDragLeave={photoDragDrop.onDragLeave}
                    onDrop={photoDragDrop.onDrop}
                    className="w-[52px] h-[52px] rounded-full overflow-hidden"
                  >
                    <Image src={profileImage ?? profile} alt="profile" width={100} height={100} unoptimized className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-row gap-[8px] items-center">
                    <input ref={photoInputRef} type="file" accept="image/png, image/jpeg" onChange={handlePhotoSelected} className="hidden" />
                    <button onClick={() => photoInputRef.current?.click()} className="s-btn-noicon-36 text-label-sm text-strong flex items-center justify-center cursor-pointer">
                      <p className="px-[4px]">{profileImage ? "Change" : "Upload"}</p>
                    </button>
                    {profileImage && (
                      <button onClick={handleRemovePhoto} className="text-label-sm text-sub cursor-pointer">Remove</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col gap-[10px] pb-[20px] border-b border-line-sub">
                <p className="text-label-sm text-sub">Full name</p>
                <div className="flex flex-row items-center gap-[8px]">
                  <div className="rounded-[10px] flex-1 h-[46px] items-center flex overflow-hidden border border-line-strong focus-within:border-line-white">
                    <input
                      type="text"
                      placeholder="Aqib Javed"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="px-[12px] py-[12px] text-paragraph-sm w-full border-none bg-transparent outline-none text-strong"
                    />
                  </div>
                  <button onClick={handleSaveName} disabled={isSaveDisabled} className="s-btn-noicon-36 text-label-sm text-strong flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    <p className="px-[4px]">Save</p>
                  </button>
                </div>
              </div>

              <Row label="Email address">{ACCOUNT_EMAIL}</Row>
            </div>
          </div>

          <div className="p-[4px] bg-surface-alpha-light-soft rounded-[20px] border border-line-sub">
            <div className="p-[16px]"><p className="text-label-sm text-sub">Delete account</p></div>
            <div className="p-[16px] border rounded-[16px] bg-surface-alpha-light-soft border-line-sub flex flex-col gap-[12px]">
              <p className="text-paragraph-sm text-sub">Permanently delete your account, images and remaining credits.</p>
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="h-[36px] w-full rounded-[8px] bg-semantic-red-alpha-25 flex items-center justify-center text-label-sm text-semantic-red-400 cursor-pointer"
              >
                Delete account
              </button>
            </div>
          </div>

          <div
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full px-[16px] py-[12px] cursor-pointer flex flex-row gap-[8px] items-center text-paragraph-sm rounded-[12px] border border-line-sub bg-surface-alpha-light-soft"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 text-sub">
              <path d="M8.33333 6.66536V4.9987C8.33333 4.55667 8.50893 4.13275 8.82149 3.82019C9.13405 3.50763 9.55797 3.33203 10 3.33203H15.8333C16.2754 3.33203 16.6993 3.50763 17.0118 3.82019C17.3244 4.13275 17.5 4.55667 17.5 4.9987V14.9987C17.5 15.4407 17.3244 15.8646 17.0118 16.1772C16.6993 16.4898 16.2754 16.6654 15.8333 16.6654H10C9.55797 16.6654 9.13405 16.4898 8.82149 16.1772C8.50893 15.8646 8.33333 15.4407 8.33333 14.9987V13.332M12.5 9.9987H2.5M5 12.4987L2.5 9.9987L5 7.4987" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sub">Logout</p>
          </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="w-full flex flex-col gap-[16px]">
          {billingData ? (
            <>
              <CardShell title="Current plan">
                {PLAN_DETAILS.map((row) => (
                  <Row key={row.label} label={row.label}>{row.value}</Row>
                ))}
                <button className="p-btn-noicon-36 w-full text-label-sm flex items-center justify-center cursor-pointer">
                  <p className="px-[4px]">Manage billing</p>
                </button>
              </CardShell>

              <CardShell title="Payment method">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-row gap-[12px] items-center">
                    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                      <rect width="32" height="24" rx="4" fill="#1B39C3" />
                      <path d="M26.222 15.9115L25.997 14.7434H23.483L23.083 15.9032L21.068 15.9073C22.0273 13.5122 22.9886 11.1179 23.952 8.72449C24.116 8.31853 24.407 8.11191 24.836 8.11399C25.164 8.1171 25.699 8.1171 26.442 8.11502L28 15.9084L26.222 15.9115ZM24.049 13.1434H25.669L25.064 10.2155L24.049 13.1434ZM11.06 8.11295L13.086 8.11502L9.954 15.9125L7.903 15.9104C7.38725 13.8508 6.87791 11.7895 6.375 9.72644C6.275 9.31528 6.077 9.02767 5.696 8.89166C5.357 8.77018 4.792 8.58329 4 8.32891V8.11606H7.237C7.797 8.11606 8.124 8.39744 8.229 8.97472C8.335 9.55304 8.601 11.0253 9.029 13.3916L11.06 8.11295ZM15.87 8.11502L14.268 15.9104L12.34 15.9084L13.94 8.11295L15.87 8.11502ZM19.78 7.9707C20.357 7.9707 21.084 8.15759 21.502 8.32891L21.164 9.94551C20.786 9.7877 20.164 9.57485 19.641 9.58212C18.881 9.59561 18.411 9.92682 18.411 10.2445C18.411 10.7616 19.227 11.0222 20.067 11.587C21.026 12.2308 21.152 12.8091 21.14 13.4373C21.127 14.7413 20.067 16.0278 17.831 16.0278C16.811 16.0122 16.443 15.9229 15.611 15.6166L15.963 13.9294C16.81 14.298 17.169 14.4153 17.893 14.4153C18.556 14.4153 19.125 14.1371 19.13 13.6522C19.134 13.3075 18.93 13.1362 18.186 12.7105C17.442 12.2837 16.398 11.6929 16.412 10.5072C16.429 8.98926 17.814 7.9707 19.781 7.9707H19.78Z" fill="white" />
                    </svg>
                    <p className="text-paragraph-sm text-strong">Visa •••• 4242</p>
                  </div>
                  <p className="underline text-label-sm text-sub cursor-pointer">Change</p>
                </div>
              </CardShell>

              <CardShell title="Billing history">
                {BILLING_HISTORY.map((row, index) => (
                  <div key={row.date} className={`w-full flex flex-col gap-[6px] ${index !== BILLING_HISTORY.length - 1 ? "pb-[16px] border-b border-line-sub" : ""}`}>
                    <div className="flex flex-row items-center justify-between">
                      <p className="text-paragraph-sm text-strong">{row.plan}</p>
                      <p className="text-label-sm text-strong">{row.amount}</p>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <p className="text-paragraph-sm text-sub">{row.date}</p>
                      <span className="px-[6px] py-[2px] w-fit rounded-[6px] bg-semantic-green-alpha-25 text-semantic-green-200 text-label-xs">{row.status}</span>
                    </div>
                  </div>
                ))}
              </CardShell>
            </>
          ) : (
            <>
              <CardShell title="Current plan">
                <div className="flex flex-col gap-[8px] items-center text-center py-[8px]">
                  <p className="text-paragraph-sm text-sub">No active plans</p>
                  <p className="text-paragraph-xs text-soft">Choose a plan and start creating</p>
                </div>
                <button onClick={() => router.push("/pricing")} className="p-btn-noicon-36 w-full text-label-sm flex items-center justify-center cursor-pointer">
                  <p className="px-[4px]">View plans</p>
                </button>
              </CardShell>

              <CardShell title="Billing history">
                <div className="flex flex-col gap-[8px] items-center text-center py-[8px]">
                  <p className="text-paragraph-sm text-sub">No billing history yet</p>
                  <p className="text-paragraph-xs text-soft">Your payments and invoices will appear here</p>
                </div>
              </CardShell>
            </>
          )}
        </div>
      )}

      {activeTab === "usage" && (
        <div className="w-full flex flex-col gap-[16px]">
          {usagedata ? (
            <>
              <CardShell title="Credit breakdown">
                <div className="pb-[16px] w-full border-b border-line-sub flex flex-row items-center justify-between">
                  <p className="text-paragraph-sm text-sub">Available credits</p>
                  <p className="text-label-lg text-strong">104</p>
                </div>
                {CREDIT_ROWS.map((row) => (
                  <div key={row.label} className="w-full flex flex-row items-center justify-between">
                    <p className="text-paragraph-sm text-sub">{row.label}</p>
                    <div className="flex flex-col items-end">
                      <p className="text-paragraph-sm text-strong">{row.value}</p>
                      {row.note && <p className="text-paragraph-xs text-soft">{row.note}</p>}
                    </div>
                  </div>
                ))}
              </CardShell>

              <button onClick={() => setIsExtraCreditsOpen(true)} className="p-btn-noicon-36 w-full flex items-center justify-center cursor-pointer">
                <p className="px-[4px] text-label-sm">Buy extra credits</p>
              </button>

              <CardShell title="Usage history">
                {USAGE_HISTORY.map((row, index) => (
                  <div key={index} className={`w-full flex flex-row gap-[12px] items-center ${index !== USAGE_HISTORY.length - 1 ? "pb-[16px] border-b border-line-sub" : ""}`}>
                    {row.image ? (
                      <div className="w-[36px] h-[36px] rounded-[8px] overflow-hidden shrink-0">
                        <Image src={row.image} alt={row.type} width={80} height={80} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-[36px] h-[36px] rounded-[8px] bg-semantic-red-alpha-25 flex items-center justify-center shrink-0">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3.79948 3.79948L12.1995 12.1995M2 8C2 8.78793 2.15519 9.56815 2.45672 10.2961C2.75825 11.0241 3.20021 11.6855 3.75736 12.2426C4.31451 12.7998 4.97595 13.2418 5.7039 13.5433C6.43185 13.8448 7.21207 14 8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2418 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2418 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 7.21207 13.8448 6.43185 13.5433 5.7039C13.2418 4.97595 12.7998 4.31451 12.2426 3.75736C11.6855 3.20021 11.0241 2.75825 10.2961 2.45672C9.56815 2.15519 8.78793 2 8 2C7.21207 2 6.43185 2.15519 5.7039 2.45672C4.97595 2.75825 4.31451 3.20021 3.75736 3.75736C3.20021 4.31451 2.75825 4.97595 2.45672 5.7039C2.15519 6.43185 2 7.21207 2 8Z" stroke="#FDB5B4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 flex flex-col gap-[2px]">
                      <div className="flex flex-row items-center justify-between">
                        <p className="text-paragraph-sm text-strong">{row.type}</p>
                        <span className={`px-[6px] py-[2px] w-fit rounded-[6px] text-label-xs ${row.status === "Completed" ? "bg-semantic-green-alpha-25 text-semantic-green-200" : "bg-semantic-red-alpha-25 text-semantic-red-200"}`}>{row.status}</span>
                      </div>
                      <div className="flex flex-row items-center justify-between">
                        <p className="text-paragraph-xs text-sub">{row.date}</p>
                        <p className="text-paragraph-xs text-sub">{row.credits}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardShell>
            </>
          ) : (
            <>
              <CardShell title="Credit breakdown">
                <div className="pb-[16px] w-full border-b border-line-sub flex flex-row items-center justify-between">
                  <p className="text-paragraph-sm text-sub">Available credits</p>
                  <p className="text-label-lg text-sub">0</p>
                </div>
                {CREDIT_ROWS.map((row) => (
                  <div key={row.label} className="w-full flex flex-row items-center justify-between">
                    <p className="text-paragraph-sm text-sub">{row.label}</p>
                    <p className="text-paragraph-sm text-sub">0</p>
                  </div>
                ))}
              </CardShell>

              <button onClick={() => router.push("/pricing")} className="p-btn-noicon-36 w-full flex items-center justify-center cursor-pointer">
                <p className="px-[4px] text-label-sm">View plans</p>
              </button>

              <CardShell title="Usage history">
                <div className="flex flex-col gap-[8px] items-center text-center py-[8px]">
                  <p className="text-paragraph-sm text-sub">No usage yet</p>
                  <p className="text-paragraph-xs text-soft">Your generated images and credit activity will appear here.</p>
                </div>
              </CardShell>
            </>
          )}
        </div>
      )}

      {/* .......Logout confirm........ */}
      {isLogoutConfirmOpen && (
        <div onClick={() => setIsLogoutConfirmOpen(false)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black-90 px-[16px]">
          <div onClick={(e) => e.stopPropagation()} className="bg-surface-weak w-full rounded-[16px] p-[24px] border border-line-sub flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <p className="text-label-lg text-strong">Log out of Foldrise?</p>
              <p className="text-paragraph-sm text-sub">You&apos;ll need to sign in again to access your account.</p>
            </div>
            <div className="flex flex-row justify-end gap-[12px]">
              <button onClick={() => setIsLogoutConfirmOpen(false)} className="s-btn-noicon-36 flex items-center justify-center text-label-sm cursor-pointer">
                <p className="px-[4px]">Cancel</p>
              </button>
              <button onClick={handleConfirmLogout} className="p-btn-noicon-36 flex items-center justify-center text-label-sm cursor-pointer">
                <p className="px-[4px]">Log out</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* .......Delete account confirm........ */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-surface-dark px-[16px]">
          <div className="w-full shrink-0 flex flex-row items-center justify-between pt-[12px] pb-[24px]">
            <p className="text-label-lg text-strong">Delete your account?</p>
            <div onClick={closeDeleteConfirm} className="w-[32px] h-[32px] rounded-full bg-surface-soft flex items-center justify-center cursor-pointer shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-[24px] pb-[24px]">
            <p className="text-paragraph-sm text-sub">This action permanently deletes your account, generated images, gallery items, saved preferences and remaining credits. It cannot be undone.</p>

            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-row gap-[12px] items-start">
                <div
                  onClick={() => setKeepImagesConfirmed((v) => !v)}
                  className={`w-[18px] h-[18px] shrink-0 rounded-[4px] border-[1.5px] border-strong cursor-pointer flex items-center justify-center ${keepImagesConfirmed ? "bg-strong" : ""}`}
                >
                  {keepImagesConfirmed && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M0.75 3.12849L3.12849 5.50699L7.88548 0.75" stroke="#0F1113" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p className="text-paragraph-sm text-strong">I have downloaded any image I want to keep.</p>
              </div>
              <div className="flex flex-row gap-[12px] items-start">
                <div
                  onClick={() => setUnderstandPermanentConfirmed((v) => !v)}
                  className={`w-[18px] h-[18px] shrink-0 rounded-[4px] border-[1.5px] border-strong cursor-pointer flex items-center justify-center ${understandPermanentConfirmed ? "bg-strong" : ""}`}
                >
                  {understandPermanentConfirmed && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M0.75 3.12849L3.12849 5.50699L7.88548 0.75" stroke="#0F1113" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p className="text-paragraph-sm text-strong">I understand that my account data and remaining credits will be permanently deleted.</p>
              </div>
            </div>

            <div className="flex flex-col gap-[10px]">
              <p className="text-label-sm text-sub">Type your email address to confirm</p>
              <div className="rounded-[10px] w-full h-[46px] items-center flex overflow-hidden border border-line-strong focus-within:border-line-white">
                <input
                  type="text"
                  placeholder="example@email.com"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  className="px-[12px] py-[12px] text-paragraph-sm w-full border-none bg-transparent outline-none text-strong placeholder:text-sub"
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))] flex flex-row gap-[10px]">
            <button onClick={closeDeleteConfirm} className="s-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer">Keep my account</button>
            <button
              onClick={closeDeleteConfirm}
              disabled={!isDeleteValid}
              className={`flex-1 text-label-sm rounded-[12px] flex items-center justify-center cursor-pointer ${
                isDeleteValid ? "bg-semantic-red-alpha-25 text-semantic-red-400" : "bg-surface-soft text-disabled cursor-not-allowed"
              }`}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* .......Buy extra credits........ */}
      {isExtraCreditsOpen && (
        <div className="fixed inset-0 z-[65] flex flex-col bg-surface-dark px-[16px]">
          <div className="w-full shrink-0 flex flex-row items-center justify-between pt-[12px] pb-[24px]">
            <p className="text-label-lg text-strong">Buy extra credits</p>
            <div onClick={() => setIsExtraCreditsOpen(false)} className="w-[32px] h-[32px] rounded-full bg-surface-soft flex items-center justify-center cursor-pointer shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-[12px] pb-[24px]">
            <p className="text-paragraph-sm text-sub">Add credits to your plan. One-time purchase, valid for 12 months.</p>
            {CREDIT_PACKS.map((pack) => (
              <div key={pack.credits} className="p-[20px] w-full flex flex-row items-center justify-between bg-surface-alpha-light-weak rounded-[16px] border border-line-sub">
                <div className="flex flex-col gap-[8px]">
                  <div className="px-[8px] py-[2px] bg-surface-alpha-light-white text-label-xs w-fit h-[24px] items-center justify-center flex text-strong rounded-[6px]">{pack.credits} credits</div>
                  <p className="text-paragraph-sm text-sub">{pack.perCredit}</p>
                  <p className="text-strong text-title-h4">{pack.price}</p>
                </div>
                <button className="p-btn-noicon-36 text-label-sm cursor-pointer"><p className="px-[4px]">Buy</p></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
