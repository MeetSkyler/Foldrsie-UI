import OptionPicker from "@/app/components/optionPicker/OptionPicker";
import { backgroundConfig } from "@/app/config/optionPickerConfig";

const page = () => {
  return <OptionPicker config={backgroundConfig} />;
};

export default page