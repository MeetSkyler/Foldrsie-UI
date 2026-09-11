"use client";
// ......MobileGenerateFlow........//
// Full-screen mobile wizard opened by "Generate now" — walks through the
// same 8 options as the desktop side drawer (face, bodyType, top, bottom,
// footwear, pose, background, aspectRatio), reusing the exact same
// optionPickerConfig data and option-selection-context so a choice made
// here shows up back on desktop (and vice versa) since they share state.
// The step-indicator/Back/Next wizard chrome itself doesn't exist on
// desktop — desktop reaches each picker via separate side-drawer links
// instead — so this chrome is mobile-only, built fresh here.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOptionSelection } from "@/app/context/option-selection-context";
import { useGenerations } from "@/app/context/generations-context";
import MobileOptionStep from "./MobileOptionStep";
import MobileGarmentStep from "./MobileGarmentStep";
import MobileAspectRatioStep from "./MobileAspectRatioStep";
import StepIndicator from "./StepIndicator";
import type { OptionPickerConfig, OptionPickerItem } from "@/app/components/optionPicker/OptionPicker";
import type { GarmentItem, GarmentPickerConfig } from "@/app/components/optionPicker/GarmentOptionPicker";
import {
  faceConfig,
  bodyTypeConfig,
  topConfig,
  bottomConfig,
  footwearConfig,
  poseConfig,
  backgroundConfig,
  aspectRatioConfig,
} from "@/app/config/optionPickerConfig";

// Same order as sideDrawer.tsx's ALL_OPTION_KEYS. Only `key`/`label`/`type`/
// `config` live here (no JSX closures) — the actual element is built in
// renderStep() below, where itemsByKey/setItemsByKey are in scope. That's
// what lets an uploaded item survive navigating Back/Next: the item LIST
// for a step used to live in that step's own local state, which reset every
// time the step remounted (only one step is ever mounted at a time), so any
// photo the user uploaded silently vanished the moment they left and
// returned to that step. Keeping the list here instead, one level up in a
// component that never unmounts for the life of the whole flow, fixes that.
type StepMeta =
  | { key: string; label: string; type: "option"; config: OptionPickerConfig }
  | { key: string; label: string; type: "garment"; config: GarmentPickerConfig }
  | { key: string; label: string; type: "aspectRatio"; config: typeof aspectRatioConfig };

const STEPS: StepMeta[] = [
  { key: "face", label: faceConfig.label, type: "option", config: faceConfig },
  { key: "bodyType", label: bodyTypeConfig.label, type: "option", config: bodyTypeConfig },
  { key: "top", label: topConfig.label, type: "garment", config: topConfig },
  { key: "bottom", label: bottomConfig.label, type: "option", config: bottomConfig },
  { key: "footwear", label: footwearConfig.label, type: "option", config: footwearConfig },
  { key: "pose", label: poseConfig.label, type: "option", config: poseConfig },
  { key: "background", label: backgroundConfig.label, type: "option", config: backgroundConfig },
  { key: "aspectRatio", label: aspectRatioConfig.label, type: "aspectRatio", config: aspectRatioConfig },
];

export default function MobileGenerateFlow({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { selections } = useOptionSelection();
  const { startGeneration } = useGenerations();
  const [stepIndex, setStepIndex] = useState(0);
  // Keyed by step key — only populated once a step actually adds an
  // upload/custom-color item; every other step just reads straight from its
  // own config.items via the `?? step.config.items` fallback below.
  const [itemsByKey, setItemsByKey] = useState<Record<string, (OptionPickerItem | GarmentItem)[]>>({});

  const step = STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;
  const hasSelection = step.key in selections;

  function handleNext() {
    if (!hasSelection) return;
    if (isLastStep) {
      const ratio = selections.aspectRatio?.ratio ?? 3 / 4;
      startGeneration(ratio);
      router.push("/generate");
      onClose();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function renderStep() {
    if (step.type === "option") {
      const items = (itemsByKey[step.key] as OptionPickerItem[] | undefined) ?? step.config.items;
      return (
        <MobileOptionStep
          key={step.key}
          config={step.config}
          items={items}
          onItemsChange={(next) => setItemsByKey((prev) => ({ ...prev, [step.key]: next }))}
        />
      );
    }
    if (step.type === "garment") {
      const items = (itemsByKey[step.key] as GarmentItem[] | undefined) ?? step.config.items;
      return (
        <MobileGarmentStep
          key={step.key}
          config={step.config}
          items={items}
          onItemsChange={(next) => setItemsByKey((prev) => ({ ...prev, [step.key]: next }))}
        />
      );
    }
    return <MobileAspectRatioStep key={step.key} config={step.config} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:hidden bg-surface-dark">
      <div className="w-full bg-surface-dark flex flex-col gap-[24px] pb-[8px] px-[16px] pt-[12px] shrink-0">
        <div className="flex flex-row items-center justify-between ">
          <p className="text-label-lg text-strong">Choose a {step.label}</p>
          <div onClick={onClose} className="w-[32px] h-[32px] rounded-full bg-surface-soft flex items-center justify-center cursor-pointer shrink-0">
           <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
           <path d="M15 5L5 15M5 5L15 15" stroke="#8C8E91" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          </div>
        </div>

        <div className="">
          <StepIndicator total={STEPS.length} activeIndex={stepIndex} />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar touch-manipulation overscroll-none bg-surface-dark">
        {renderStep()}
      </div>

      <div className="shrink-0 px-[16px] pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))] flex flex-row gap-[10px] bg-surface-dark">
        {!isFirstStep && (
          <button onClick={handleBack} className="s-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer">
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!hasSelection}
          className="p-btn-noicon-48 flex-1 text-label-sm flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          {isLastStep ? "Generate" : "Next"}
        </button>
      </div>
    </div>
  );
}
