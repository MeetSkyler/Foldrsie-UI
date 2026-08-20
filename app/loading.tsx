export default function Loading() {
  // Sidebar/navbar/drawer stay interactive (they live in the persistent
  // layout, not here) — this only fills the page-content area while the
  // next route streams in, so a click never feels like it did nothing.
  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-900">
      <p className="text-paragraph-sm text-sub flex items-center">
        Loading
        <span className="loading-dot" style={{ animationDelay: '0s' }}>.</span>
        <span className="loading-dot" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="loading-dot" style={{ animationDelay: '0.4s' }}>.</span>
      </p>
    </div>
  );
}
