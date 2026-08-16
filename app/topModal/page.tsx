import GarmentOptionPicker from "@/app/components/optionPicker/GarmentOptionPicker";
import { topConfig } from "@/app/config/optionPickerConfig";

const page = () => {
  return <GarmentOptionPicker config={topConfig} />;
};

export default page