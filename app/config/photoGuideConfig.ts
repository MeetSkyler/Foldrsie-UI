import type { StaticImageData } from "next/image";
import face1 from "@/public/GuideLines/face1.webp";
import face2 from "@/public/GuideLines/face2.webp";
import face3 from "@/public/GuideLines/face3.webp";
import face4 from "@/public/GuideLines/face4.webp";
import wface1 from "@/public/GuideLines/wface1.webp";
import wface2 from "@/public/GuideLines/wface2.webp";
import wface3 from "@/public/GuideLines/wface3.webp";
import wface4 from "@/public/GuideLines/wface4.webp";
import shirt1 from "@/public/GuideLines/shirt1.webp";
import shirt2 from "@/public/GuideLines/shirt2.webp";
import shirt3 from "@/public/GuideLines/shirt3.webp";
import shirt4 from "@/public/GuideLines/shirt4.webp";
import wshirt1 from "@/public/GuideLines/wshirt1.webp";
import wshirt2 from "@/public/GuideLines/wshirt2.webp";
import wshirt3 from "@/public/GuideLines/wshirt3.webp";
import wshirt4 from "@/public/GuideLines/wshirt4.webp";
import bottom1 from "@/public/GuideLines/bottom1.webp";
import bottom2 from "@/public/GuideLines/bottom2.webp";
import bottom3 from "@/public/GuideLines/bottom3.webp";
import bottom4 from "@/public/GuideLines/bottom4.webp";
import wbottom1 from "@/public/GuideLines/wbottom1.webp";
import wbottom2 from "@/public/GuideLines/wbottom2.webp";
import wbottom3 from "@/public/GuideLines/wbottom3.webp";
import wbottom4 from "@/public/GuideLines/wbottom4.webp";
import shoe1 from "@/public/GuideLines/shoe1.webp";
import shoe2 from "@/public/GuideLines/shoe2.webp";
import shoe3 from "@/public/GuideLines/shoe3.webp";
import shoe4 from "@/public/GuideLines/shoe4.webp";
import wshoe1 from "@/public/GuideLines/wshoe1.webp";
import wshoe2 from "@/public/GuideLines/wshoe2.webp";
import wshoe3 from "@/public/GuideLines/wshoe3.webp";
import wshoe4 from "@/public/GuideLines/wshoe4.webp";

export type PhotoGuideExample = { image: StaticImageData; caption: string };

export type PhotoGuideData = {
  title: string;
  subtitle: string;
  doItems: PhotoGuideExample[];
  avoidItems: PhotoGuideExample[];
};

// One entry per option that shows a "Photo guide" link (Face, Top, Bottom,
// Footwear — Pose has its own accuracy note instead, and Background/Body
// type don't have an upload card at all). Images come from
// public/GuideLines: the plain-named set (face1, shirt1, bottom1, shoe1...)
// is the "do" examples, the w-prefixed set (wface1, wshirt1...) is "avoid".
export const PHOTO_GUIDES: Record<string, PhotoGuideData> = {
  face: {
    title: "Face photo guide",
    subtitle: "Use a clear, front-facing photo so Foldrise can match the face accurately.",
    doItems: [
      { image: face1, caption: "Face centred" },
      { image: face2, caption: "Even lighting" },
      { image: face3, caption: "Simple background" },
      { image: face4, caption: "Face fully visible" },
    ],
    avoidItems: [
      { image: wface1, caption: "Too dark" },
      { image: wface2, caption: "Busy background" },
      { image: wface3, caption: "Side angle" },
      { image: wface4, caption: "Covered or blurred" },
    ],
  },
  top: {
    title: "Top photo guide",
    subtitle: "Use a flat, well-lit photo so Foldrise can match the garment accurately.",
    doItems: [
      { image: shirt1, caption: "Fully laid flat" },
      { image: shirt2, caption: "Even lighting" },
      { image: shirt3, caption: "Plain background" },
      { image: shirt4, caption: "Whole garment visible" },
    ],
    avoidItems: [
      { image: wshirt1, caption: "Folded or bunched" },
      { image: wshirt2, caption: "Too dark" },
      { image: wshirt3, caption: "Cluttered background" },
      { image: wshirt4, caption: "Cropped edges" },
    ],
  },
  bottom: {
    title: "Bottom photo guide",
    subtitle: "Use a flat, well-lit photo so Foldrise can match the garment accurately.",
    doItems: [
      { image: bottom1, caption: "Fully laid flat" },
      { image: bottom2, caption: "Even lighting" },
      { image: bottom3, caption: "Plain background" },
      { image: bottom4, caption: "Whole garment visible" },
    ],
    avoidItems: [
      { image: wbottom1, caption: "Folded or bunched" },
      { image: wbottom2, caption: "Too dark" },
      { image: wbottom3, caption: "Cluttered background" },
      { image: wbottom4, caption: "Cropped edges" },
    ],
  },
  footwear: {
    title: "Footwear photo guide",
    subtitle: "Use a clear, full-shoe photo so Foldrise can match the footwear accurately.",
    doItems: [
      { image: shoe1, caption: "Both shoes shown" },
      { image: shoe2, caption: "Even lighting" },
      { image: shoe3, caption: "Plain background" },
      { image: shoe4, caption: "Full shoe visible" },
    ],
    avoidItems: [
      { image: wshoe1, caption: "Cropped shoe" },
      { image: wshoe2, caption: "Too dark" },
      { image: wshoe3, caption: "Cluttered background" },
      { image: wshoe4, caption: "Extreme angle" },
    ],
  },
};
