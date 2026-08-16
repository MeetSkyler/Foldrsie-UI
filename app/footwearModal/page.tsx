import OptionPicker from "@/app/components/optionPicker/OptionPicker";
import { footwearConfig } from "@/app/config/optionPickerConfig";

const page = () => {
  return <OptionPicker config={footwearConfig} />;
};

export default page