// ......StepIndicator........//
// Equal-width segments, one per step — the current step and every step
// already completed stay bright (bg-strong) so progress accumulates as the
// user moves forward; only steps still ahead stay muted (bg-line-sub).
export default function StepIndicator({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) {
  return (
    <div className="flex flex-row gap-[8px] w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-[4px] rounded-full transition-all duration-150 ease-in-out ${
            i <= activeIndex ? "bg-strong" : "bg-line-sub"
          }`}
        />
      ))}
    </div>
  );
}
