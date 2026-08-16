import OptionPicker from "@/app/components/optionPicker/OptionPicker";
import { faceConfig } from "@/app/config/optionPickerConfig";

const page = () => {
  return <OptionPicker config={faceConfig} />;
};

export default page