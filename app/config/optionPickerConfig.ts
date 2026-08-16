import type { OptionPickerConfig } from "@/app/components/optionPicker/OptionPicker";
import type { GarmentPickerConfig } from "@/app/components/optionPicker/GarmentOptionPicker";
import type { AspectRatioConfig } from "@/app/components/optionPicker/AspectRatioPicker";
import img1 from "@/public/img1.jpg";
import img2 from "@/public/img2.png";
import img3 from "@/public/img3.jpg";
import img4 from "@/public/img4.jpg";
import img5 from "@/public/img5.jpg";
import img6 from "@/public/img6.png";

// Placeholder images until real face assets are available — swap `items` per
// option with real data. Add one entry per side-drawer option (pose, top,
// bottom, footwear, background, bodyType, aspectRatio) following this shape.
export const faceConfig: OptionPickerConfig = {
  key: "face",
  label: "face",
  description:"faces",
  categories: ["All", "Male", "Female"],
  uploadEnabled: true,
  items: [
    { id: "1", image: img1 },
    { id: "2", image: img2 },
    { id: "3", image: img3 },
    { id: "4", image: img4 },
    { id: "5", image: img5 },
    { id: "6", image: img6 },
  ],
};

export const bodyTypeConfig: OptionPickerConfig = {
  key: "bodyType",
  label: "body type",
  description: "body types",
  categories: ["All", "Male", "Female"],
  autoOption: { title: "Auto", subtitle: "Choose for me" },
  items: [
    { id: "1", image: img1 },
    { id: "2", image: img3 },
    { id: "3", image: img4 },
    { id: "4", image: img5 },
    { id: "5", image: img6 },
  ],
};

export const topConfig: GarmentPickerConfig = {
  key: "top",
  label: "top",
  description: "tops",
  categories: ["All", "Male", "Female"],
  items: [
    { id: "1", front: img1 },
    { id: "2", front: img3 },
    { id: "3", front: img4 },
    { id: "4", front: img5 },
    { id: "5", front: img6 },
  ],
};

export const bottomConfig: OptionPickerConfig = {
  key: "bottom",
  label: "bottom",
  description: "bottoms",
  categories: ["All", "Male", "Female"],
  uploadEnabled: true,
  items: [
    { id: "1", image: img1 },
    { id: "2", image: img2 },
    { id: "3", image: img3 },
    { id: "4", image: img4 },
    { id: "5", image: img5 },
    { id: "6", image: img6 },
  ],
};

export const footwearConfig: OptionPickerConfig = {
  key: "footwear",
  label: "footwear",
  description: "footwear",
  categories: ["All", "Male", "Female"],
  uploadEnabled: true,
  items: [
    { id: "1", image: img1 },
    { id: "2", image: img2 },
    { id: "3", image: img3 },
    { id: "4", image: img4 },
    { id: "5", image: img5 },
    { id: "6", image: img6 },
  ],
};

export const backgroundConfig: OptionPickerConfig = {
  key: "background",
  label: "background",
  description: "backgrounds",
  colorPickerEnabled: true,
  items: [
    { id: "1", image: img1 },
    { id: "2", image: img2 },
    { id: "3", image: img3 },
    { id: "4", image: img4 },
    { id: "5", image: img5 },
    { id: "6", image: img6 },
  ],
};

export const poseConfig: OptionPickerConfig = {
  key: "pose",
  label: "pose",
  description: "poses",
  uploadEnabled: true,
  items: [
    { id: "1", image: img1 },
    { id: "2", image: img2 },
    { id: "3", image: img3 },
    { id: "4", image: img4 },
    { id: "5", image: img5 },
    { id: "6", image: img6 },
  ],
};

export const aspectRatioConfig: AspectRatioConfig = {
  key: "aspectRatio",
  label: "aspect ratio",
  description: "aspect ratios",
  items: [
    { id: "1", name: "Classic", ratioLabel: "2:3", ratio: 2 / 3 },
    { id: "2", name: "Portrait", ratioLabel: "1:1", ratio: 1 },
    { id: "3", name: "Portrait", ratioLabel: "4:5", ratio: 4 / 5 },
    { id: "4", name: "Vertical", ratioLabel: "9:16", ratio: 9 / 16 },
    { id: "5", name: "Landscape", ratioLabel: "16:9", ratio: 16 / 9 },
    { id: "6", name: "Portrait", ratioLabel: "3:4", ratio: 3 / 4 },
  ],
};
