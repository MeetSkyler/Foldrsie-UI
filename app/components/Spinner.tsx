// ......Spinner........//
// Small reusable loading spinner — 8 fading radial ticks rotating
// continuously (classic iOS-activity-indicator look), sized/colored via
// props so it drops into any button/text row. Uses `currentColor`, so it
// automatically follows whatever text color its container already has
// (e.g. a disabled button's dimmed text color).
export default function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  const ticks = Array.from({ length: 8 });
  return (
    <div className={`animate-spin shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        {ticks.map((_, i) => (
          <line
            key={i}
            x1="8"
            y1="1.5"
            x2="8"
            y2="4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={1 - i * 0.1}
            transform={`rotate(${i * 45} 8 8)`}
          />
        ))}
      </svg>
    </div>
  );
}
