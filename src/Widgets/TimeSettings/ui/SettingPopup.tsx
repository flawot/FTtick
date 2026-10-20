import { IconButton } from "../../../Shared/ui/IconButton";
import {
  faAngleLeft,
  faMinus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { SettingRussian, SettingType, SettingUnits } from "../model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface IProps {
  hidePopup: () => void;
  setting: SettingType;
  initial: number;
  change: (type: SettingType, mode: "inc" | "dec") => void;
}

export const SettingPopup = ({
  hidePopup,
  setting,
  initial,
  change,
}: IProps) => {
  const [data, setData] = useState<number>(initial);

  return (
    <div className="fixed z-100 top-0 left-0 h-screen w-screen bg-background">
      <span className="absolute left-4 top-4">
        <IconButton icon={faAngleLeft} onClick={() => hidePopup()} />
      </span>

      <span className="absolute w-60 text-center top-20 left-1/2 -translate-x-1/2 text-xl">
        {SettingRussian[setting]}
      </span>

      <span className="absolute top-1/2 -translate-y-1/2 left-15">
        <button
          className="w-9 flex justify-center items-center text-lg text-foreground/50 transition-all duration-100 hover:scale-105 active:scale-95 rounded-xl cursor-pointer aspect-square border border-foreground"
          onClick={() => {
            setData((prev) => prev - 1);
            change(setting, "dec");
          }}
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
      </span>

      <span className="absolute top-1/2 left-1/2 -translate-1/2 font-medium text-5xl">
        {data}
      </span>

      <span className="absolute top-1/2 -translate-y-1/2 right-15">
        <button
          className="w-9 flex justify-center items-center text-lg text-foreground/50 transition-all duration-100 hover:scale-105 active:scale-95 rounded-xl cursor-pointer aspect-square border border-foreground"
          onClick={() => {
            setData((prev) => prev + 1);
            change(setting, "inc");
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </span>

      <span className="absolute top-43 left-1/2 -translate-x-1/2 text-lg text-foreground/50">
        {SettingUnits[setting]}
      </span>
    </div>
  );
};
