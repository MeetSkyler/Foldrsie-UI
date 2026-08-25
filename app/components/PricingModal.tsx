"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePricingModal } from "@/app/context/pricing-modal-context";

// One digit of a slot-machine/odometer reel: all ten digits are stacked in
// a column and the whole column translates vertically so the target digit
// lands in view — a real digit *roll*, not a text swap. `rowHeight` must
// match the surrounding text's own line-height so each stacked row lines up
// exactly with one line of text; `tabular-nums` on the parent keeps every
// digit character the same width, which is what lets the column's natural
// width already match a single digit (no separate width has to be guessed).
function OdometerDigit({ digit, rowHeight }: { digit: number; rowHeight: number }) {
  return (
    <span className="relative inline-block overflow-hidden align-baseline" style={{ height: rowHeight }}>
      <motion.span
        className="flex flex-col"
        // `initial` explicitly matches `animate`'s target so first mount
        // (the modal's default Monthly view) renders each digit already in
        // its correct resting spot with no roll-in — the reel only ever
        // animates on a later prop change (an actual billing switch).
        initial={{ y: -digit * rowHeight }}
        animate={{ y: -digit * rowHeight }}
        // A light spring (rather than a fixed-duration ease) gives the roll
        // a small natural overshoot-and-settle instead of a mechanical
        // linear stop — the "premium, coordinated" feel asked for.
        transition={{ type: "spring", stiffness: 160, damping: 28, mass: 0.7,}}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} style={{ height: rowHeight, lineHeight: `${rowHeight}px` }}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

// Matches the original data exactly — whole numbers (monthly prices, like
// 19) render with no decimal point, non-whole ones (annual prices, like
// 15.83) render with 2. Only the digit characters roll; punctuation (the
// decimal point) stays static since there's nothing to roll between two
// dots, and if decimals appear/disappear entirely between the monthly and
// annual state, those reels simply mount/unmount rather than rolling.
function OdometerNumber({ value, rowHeight }: { value: number; rowHeight: number }) {
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return (
    <span className="inline-flex tabular-nums" style={{ height: rowHeight }}>
      {formatted.split("").map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <OdometerDigit key={i} digit={Number(ch)} rowHeight={rowHeight} />
        ) : (
          <span key={i} style={{ height: rowHeight, lineHeight: `${rowHeight}px` }}>
            {ch}
          </span>
        )
      )}
    </span>
  );
}

// Array-driven so adding a new question later is just one more object here —
// nothing else in the accordion below needs to change.
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is an image credit?",
    answer: "One credit creates one standard 2K image. Selected 4K poses use 2 credits.",
  },
  {
    question: "Do all plans include the same features?",
    answer: "Yes. Every plan includes all Foldrise tools. Only the number of monthly credits and price per image differ.",
  },
  {
    question: "How does annual billing work?",
    answer: "You pay once for the full year and get two months free. Credits are added to your account each month.",
  },
  {
    question: "Do unused credits roll over?",
    answer: "Plan credits roll over for up to 90 days. Extra credits purchased through top-ups remain valid for 12 months.",
  },
  {
    question: "Can I buy more credits without upgrading?",
    answer: "Yes. You can purchase extra credits anytime without changing your current plan.",
  },
  {
    question: "What happens if an image generation fails?",
    answer: "If a generation fails, the credits used for it are automatically returned to your account.",
  },
  {
    question: "Can I change or cancel my plan?",
    answer: "Yes. You can upgrade anytime. Downgrades and cancellations take effect at the end of your current billing period.",
  },
  {
    question: "Can I use generated images commercially?",
    answer: "Yes. You can use generated images for your website, social media and advertising, provided you have permission to use the assets you upload.",
  },
];

type BillingCycle = "monthly" | "annual";

const BILLING_OPTIONS: { key: BillingCycle; label: string; badge?: string }[] = [
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Annually", badge: "Save 17%" },
];

type BillingData = {
  price: number;
  perImage: number;
  // Only set for the annual cycle.
  billedTotal?: number;
  saveTotal?: number;
};

type PlanTier = {
  id: string;
  name: string;
  description: string;
  credits: number;
  isPopular?: boolean;
  // Same at both billing cycles per the design — not duplicated per cycle.
  savingsVsStarterPercent?: number;
  // Only Growth's annual credits line carries the info icon in the design.
  showInfoOnAnnualCredits?: boolean;
  monthly: BillingData;
  annual: BillingData;
};

const PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For small brands creating content \n for a few products.",
    credits: 20,
    monthly: { price: 19, perImage: 0.95 },
    annual: { price: 15.83, perImage: 0.79, billedTotal: 190, saveTotal: 38 },
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing brands creating content \n for regular product drops.",
    isPopular: true,
    credits: 80,
    savingsVsStarterPercent: 35,
    showInfoOnAnnualCredits: true,
    monthly: { price: 49, perImage: 0.61 },
    annual: { price: 40.83, perImage: 0.51, billedTotal: 490, saveTotal: 98 },
  },
  {
    id: "studio",
    name: "Studio",
    description: "For agencies and teams producing \n larger product catalogues.",
    credits: 180,
    savingsVsStarterPercent: 42,
    monthly: { price: 99, perImage: 0.55 },
    annual: { price: 82.5, perImage: 0.46, billedTotal: 990, saveTotal: 198 },
  },
];

const PricingModal = () => {
  const { isPricingOpen, closePricing } = usePricingModal();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  // Accordion — only one question open at a time, first one open by default.
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!isPricingOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closePricing();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPricingOpen, closePricing]);

  if (!isPricingOpen) return null;

  return (
    <div onClick={closePricing} className="fixed inset-0 z-50 bg-black-90 flex flex-col pt-[60px] px-[120px] items-center ">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface-weak w-full rounded-tr-[24px] rounded-tl-[24px] overflow-hidden border border-line-sub flex flex-col">

        {/* shrink-0 keeps this pinned at the top — only the block below it
            (the cards) scrolls. */}
        <div className="w-full h-[72px] shrink-0 border-b border-line-sub p-[24px] flex flex-row items-center justify-between">
          <p className="text-label-lg text-strong">Choose your plan</p>

          <div onClick={closePricing} className="w-[24px] h-[24px] flex items-center justify-center cursor-pointer">
            <svg  width="16" height="16" viewBox="0 0 16 16" fill="none">
             <path d="M12 4L4 12M4 4L12 12" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

        </div>
        {/* ............ Main Cards Block ............ */}

        <div className="flex-1 min-h-0 overflow-y-auto bg-surface-weak  no-scrollbar py-[80px] w-full px-[24px]">
          <div className="w-full flex flex-col gap-[32px]">
            {/* .......Top btn change bar........ */}
            <div className="w-full h-[40px]  flex items-center justify-center">

              <div className="p-[2px] h-full  w-fit border border-line-sub bg-surface-alpha-light-soft rounded-[12px] flex flex-row">
                {BILLING_OPTIONS.map((opt) => {
                  const isActive = billing === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setBilling(opt.key)}
                      className="relative px-[12px] py-[8px] h-full rounded-[10px] flex items-center justify-center cursor-pointer"
                    >
                      {isActive && (
                        // Shared layoutId — when the active key changes, this
                        // div unmounts from the old button and mounts in the
                        // new one; Framer Motion treats that as the same
                        // element moving and animates the slide instead of
                        // snapping, without any manual position measuring.
                        <motion.div
                          layoutId="billingPillHighlight"
                          className="absolute inset-0 rounded-[10px] bg-surface-alpha-light-white"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                        />
                      )}
                      {/* Same text-label-sm weight active or not — switching
                          weight (like text-paragraph-sm) renders at a
                          different width and makes every pill jitter as the
                          active one changes. Only color marks active state. */}
                      <p className={`relative text-label-sm ${isActive ? "text-strong" : "text-soft"}`}>
                        {opt.label}
                        {opt.badge && <span className="text-semantic-green-400"> {opt.badge}</span>}
                      </p>
                    </button>
                  );
                })}
              </div>

            </div>

            <div className="w-full h-full p-[32px]  gap-[56px] flex flex-col items-center justify-center">
              {/* max-w-[800px] matches the "How credits work"/FAQ sections
                  below, which already cap at this width — without it, this
                  was the one block still stretching edge-to-edge on large
                  screens while everything else in the modal stayed capped.
                  The shared parent's items-center still centers it. */}
              <div className="w-full h-full max-w-[1104px] flex flex-col gap-[16px]">
                <div className="w-full  flex flex-row  gap-[16px]">

                  {PLANS.map((plan) => {
                    const data = billing === "monthly" ? plan.monthly : plan.annual;
                    const showInfo = plan.showInfoOnAnnualCredits && billing === "annual";
                    const planbtn = plan.name==="Growth";
                    return (
                      <div
                        key={plan.id}
                        className={`relative pt-[32px] h-[520px] pb-[20px] px-[20px] w-[352px] border bg-surface-alpha-light-soft rounded-[20px] flex flex-col justify-between ${
                          plan.isPopular ? "border-white" : "border-line-sub"
                        }`}
                      >
                        {plan.isPopular && (
                          <div className="absolute -top-[13px] left-[20px] bg-white h-[24px] text-[#101214] text-label-xs px-[8px] py-[2px] rounded-[6px] flex items-center gap-[4px]">
                            <svg width="11" height="14" viewBox="0 0 11 14" fill="none">
                              <path d="M4.5 0.5C5.278 1.24533 6.722 4.25533 5.16667 6.46067C6.10667 7.206 6.88867 7.206 8.278 4.97067C9.012 5.76067 9.83333 7.55467 9.83333 8.696C9.83333 11.1653 7.744 13.1667 5.16667 13.1667C2.58933 13.1667 0.5 11.1653 0.5 8.696C0.5 7.38467 1.102 5.90933 2.05533 4.97067C3.01 4.03267 4.5 2.76333 4.5 0.5Z" fill="#0B0D0E" fillOpacity="0.2" stroke="#0B0D0E" strokeOpacity="0.97" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p>Most popular</p>
                          </div>
                        )}

                        <div className="flex flex-col items-center justify-center gap-[32px] ">

                          <div className="flex flex-col w-full gap-[32px]">
                            <div className="flex items-center justify-center flex-col gap-[8px] ">
                              <p className="text-label-sm text-strong">{plan.name}</p>
                              <p className="text-center text-paragraph-sm text-soft">{plan.description}</p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-[8px] ">
                              <div className="flex items-center justify-center text-title-h4 text-strong tabular-nums">
                                <p className="inline-flex items-baseline">$<OdometerNumber value={data.price} rowHeight={40} /></p><sub className="text-paragraph-sm text-sub">/month</sub>
                              </div>
                              {billing === "annual" && (
                                <>
                                  <div className="flex flex-col gap-[12px]">
                                    <p className="text-paragraph-sm text-sub">Billed ${data.billedTotal} annually</p>
                                  <p className="text-label-xs  px-[8px] py-[2px] h-[24px] text-label-xs text-semantic-green-200 flex items-center justify-center bg-semantic-green-alpha-25 rounded-[6px]">
                                    Save ${data.saveTotal} annually
                                  </p>
                                  </div>
                                </>
                              )}
                            </div>
                            {/* Extra margin on top of the parent's gap-[32px] — just for this
                                divider, so the price block above and the features list below
                                get a bit more breathing room without changing any other gap. */}
                            <div className="w-full border-b border-dashed border-line-sub"></div>
                          </div>

                          <div className="flex flex-col gap-[12px] w-full">

                            <div className="flex flex-row gap-[8px] items-center justify-start">
                              <div className="w-[32px] h-[32px] bg-surface-alpha-light-weak rounded-full flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                 <path d="M6 9.33333C6 10.438 7.79067 11.3333 10 11.3333C12.2093 11.3333 14 10.438 14 9.33333M6 9.33333C6 8.22867 7.79067 7.33333 10 7.33333C12.2093 7.33333 14 8.22867 14 9.33333M6 9.33333V12C6 13.104 7.79067 14 10 14C12.2093 14 14 13.104 14 12V9.33333M2 4C2 4.71467 2.76267 5.37467 4 5.732C5.23733 6.08933 6.76267 6.08933 8 5.732C9.23733 5.37467 10 4.71467 10 4C10 3.28533 9.23733 2.62533 8 2.268C6.76267 1.91067 5.23733 1.91067 4 2.268C2.76267 2.62533 2 3.28533 2 4ZM2 4V10.6667C2 11.2587 2.51467 11.6333 3.33333 12M2 7.33333C2 7.92533 2.51467 8.3 3.33333 8.66667" stroke="#6F7073" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg></div>
                              <p className="text-paragraph-sm text-strong">{plan.credits} image credits <span className="text-sub">each month</span></p>
                              {showInfo && (
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-sub shrink-0">
                                  <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.2" />
                                  <path d="M8 7.33333V11.3333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                  <circle cx="8" cy="5.16667" r="0.75" fill="currentColor" />
                                </svg>
                              )}
                            </div>

                              <div className="flex flex-row gap-[8px] w-full items-center justify-start">
                              <div className="w-[32px] h-[32px] bg-surface-alpha-light-weak rounded-full flex items-center shrink-0 justify-center">
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                 <path d="M4.33333 5C4.33333 5.17681 4.40357 5.34638 4.5286 5.4714C4.65362 5.59643 4.82319 5.66667 5 5.66667C5.17681 5.66667 5.34638 5.59643 5.4714 5.4714C5.59643 5.34638 5.66667 5.17681 5.66667 5C5.66667 4.82319 5.59643 4.65362 5.4714 4.5286C5.34638 4.40357 5.17681 4.33333 5 4.33333C4.82319 4.33333 4.65362 4.40357 4.5286 4.5286C4.40357 4.65362 4.33333 4.82319 4.33333 5Z" stroke="#6F7073" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                 <path d="M2 4V7.448C2.00008 7.80159 2.1406 8.14068 2.39067 8.39067L7.53067 13.5307C7.83197 13.8319 8.24059 14.0012 8.66667 14.0012C9.09274 14.0012 9.50137 13.8319 9.80267 13.5307L13.5307 9.80267C13.8319 9.50137 14.0012 9.09274 14.0012 8.66667C14.0012 8.24059 13.8319 7.83197 13.5307 7.53067L8.39067 2.39067C8.14068 2.1406 7.80159 2.00008 7.448 2H4C3.46957 2 2.96086 2.21071 2.58579 2.58579C2.21071 2.96086 2 3.46957 2 4Z" stroke="#6F7073" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                               </svg></div>

                                {/* Two separate groups (price+label, then the comparison
                                    text) with justify-between pushing them to opposite
                                    ends — not one long string, so "less than Starter"
                                    always sits at the row's far right. */}
                                <div className="flex flex-row items-center justify-between w-full">
                                  <p className="text-paragraph-sm text-strong tabular-nums">
                                    $<OdometerNumber value={data.perImage} rowHeight={20} /> <span className="text-sub">per image</span>
                                  </p>
                                  {plan.savingsVsStarterPercent && (
                                    <p className="text-semantic-green-400 text-paragraph-sm text-nowrap">{plan.savingsVsStarterPercent}% less than Starter</p>
                                  )}
                                </div>

                            </div>

                          </div>
                        </div>

                        <div className={`flex items-center justify-center text-label-sm text-strong cursor-pointer ${planbtn?"p-btn-noicon-36":"s-btn-noicon-36"}`}><p>Choose {plan.name}</p></div>
                      </div>
                    );
                  })}
                </div>
                <div className="w-full h-full flex items-center pt-[8px] justify-center gap-[6px]">
                 <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <g clipPath="url(#clip0_979_22335)">
                    <rect x="3.96973" y="8.53516" width="12.0605" height="9.16514" rx="1.66667" stroke="#6F7073" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M13.3327 9.16667V5.83333C13.3327 3.99238 11.8403 2.5 9.99935 2.5C8.1584 2.5 6.66602 3.99238 6.66602 5.83333V9.16667" stroke="#6F7073" strokeWidth="1.2" strokeLinejoin="round"/>
                    <line opacity="0.9" x1="9.98574" y1="12.8344" x2="9.98574" y2="13.7177" stroke="#6F7073" strokeWidth="1.2" strokeLinecap="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_979_22335">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                  <p className="text-paragraph-sm text-soft">Secure checkout via Polar</p>
                </div>
              </div>


            {/* ..............small break Line......... */}
              <div className="w-full flex items-center justify-center"><span className="w-[44px] border-b border-line-strong"></span></div>

            <div className="flex flex-col items-center justify-center w-full max-w-[800px] gap-[16px]">
               {/* ....HowCreditsWork..... */}
               <div className="w-full p-[4px] bg-surface-alpha-light-soft border border-line-sub rounded-[20px]">
                <div
                className="px-[20px] py-[16px] flex items-center justify-start">
                <p className="text-label-sm text-sub">How credits work</p>
                </div>

                <div className="w-full  py-[24px] px-[20px] rounded-[16px] bg-surface-alpha-light-soft border border-line-sub flex flex-col gap-[24px]">
                  <div className="flex flex-row items-center justify-between w-full">
                    <p className="text-strong text-paragraph-sm">Standard poses</p>
                    <div className="px-[8px] py-[2px]  h-[24px] flex items-center justify-center rounded-[6px] text-label-xs bg-white-20 text-neutral-50">1 credit</div>
                    </div>

                    <div className="w-full border-b border-line-sub "></div>

                    <div className="flex flex-row items-center justify-between w-full">
                    <p className="text-strong text-paragraph-sm">Standard poses</p>
                    <div className="px-[8px] py-[2px]  h-[24px] rounded-[6px] flex items-center justify-center bg-white-20 text-label-xs text-neutral-50">2 credits</div>
                    </div>

                </div>
                 </div>

                 {/* specailPoseText */}
                 <div className="flex flex-row items-center justify-start pl-[24px] gap-[8px] w-full">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                   <path d="M8 6H8.00667M7.33333 8H8V10.6667H8.66667M2 8C2 8.78793 2.15519 9.56815 2.45672 10.2961C2.75825 11.0241 3.20021 11.6855 3.75736 12.2426C4.31451 12.7998 4.97595 13.2418 5.7039 13.5433C6.43185 13.8448 7.21207 14 8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2418 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2418 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 6.4087 13.3679 4.88258 12.2426 3.75736C11.1174 2.63214 9.5913 2 8 2C6.4087 2 4.88258 2.63214 3.75736 3.75736C2.63214 4.88258 2 6.4087 2 8Z" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-paragraph-xs text-soft">Special poses cost 2 credits because they need extra compute, priced at cost.</p>
                  </div>
            </div>

               {/* ..............small break Line......... */}
            <div className="w-full flex items-center justify-center"><span className="w-[44px] border-b border-line-strong"></span></div>

            {/* .........Frequently Ask Questions........ */}
             <div
             className="flex flex-col w-full max-w-[800px] items-center  gap-[32px]">
             <p className="text-label-lg text-strong">Frequently Asked Questions</p>
            {/* ........... QuestionsDropDown....... */}
             <div className="w-full flex flex-col gap-[8px] items-center">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={item.question}
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    // Click target is the whole card now, not just the
                    // question+icon strip — clicking anywhere in this
                    // padded area (including the padding itself) toggles it.
                    className={`w-full rounded-[16px] border border-line-sub p-[20px] cursor-pointer ${isOpen ? "bg-surface-alpha-light-weak" : "bg-surface-alpha-light-soft"}`}
                  >
                    <div className="w-full flex flex-row items-center justify-between">
                      <p className="text-label-sm text-strong text-left">{item.question}</p>
                    <div className=" w-[20px] h-[20px] flex items-center justify-center">
                        <motion.svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        // This icon points up by default, so the rotation is
                        // inverted from a down-chevron: closed rotates it to
                        // point down (expand), open leaves it pointing up
                        // (collapse) — matches the reference screenshot.
                        animate={{ rotate: isOpen ? 0 : 180 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="shrink-0"
                      >
                        <path d="M4.5 11.25L9 6.75L13.5 11.25" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </div>
                    </div>
                    {/* height:auto isn't directly animatable, so Framer
                        measures the real content height each time this
                        mounts/unmounts and tweens to/from it — a smooth
                        expand instead of an instant show/hide. */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-paragraph-sm text-sub pt-[12px]">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
             </div>
             </div>

            </div>
          </div>

        </div>
      </div>


    </div>
  );
};

export default PricingModal;
