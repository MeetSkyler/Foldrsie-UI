import AspectRatioPicker from "@/app/components/optionPicker/AspectRatioPicker";
import { aspectRatioConfig } from "@/app/config/optionPickerConfig";

const page = () => {
  return <AspectRatioPicker config={aspectRatioConfig} />;
};

export default page