import OptionPicker from "@/app/components/optionPicker/OptionPicker";
import { bottomConfig } from "@/app/config/optionPickerConfig";

const page = () => {
  return <OptionPicker config={bottomConfig} />;
};

export default page