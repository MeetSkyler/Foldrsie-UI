import OptionPicker from "@/app/components/optionPicker/OptionPicker";
import { bodyTypeConfig } from "@/app/config/optionPickerConfig";

const page = () => {
  return <OptionPicker config={bodyTypeConfig} />;
};

export default page