import OptionPicker from "@/app/components/optionPicker/OptionPicker";
import { poseConfig } from "@/app/config/optionPickerConfig";

const page = () => {
  return <OptionPicker config={poseConfig} />;
};

export default page