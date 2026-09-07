// ......MobileGalleryHome........//
// Dummy placeholder for the Gallery route on mobile — desktop's real
// gallery grid (app/gallery/page.tsx) stays untouched.
export default function MobileGalleryHome() {
  return (
    <div className="flex md:hidden w-full h-full items-center justify-center bg-purple-900">
      <p className="text-title-h6 text-strong">Gallery</p>
    </div>
  );
}
