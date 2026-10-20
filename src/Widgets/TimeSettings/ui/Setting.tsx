import {
  SettingType,
  SettingRussian,
  SettingUnits,
  SettingsData,
} from "../model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { SettingPopup } from "./SettingPopup";
import { load } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";

interface IProps {
  value: number;
  setting: SettingType;
}

export const Setting = ({ value, setting }: IProps) => {
  const [isActivate, setIsActivate] = useState<boolean>(false);
  const [data, setData] = useState<number>(value);

  const changeSetting = async (type: SettingType, mode: "inc" | "dec") => {
    let num = type === "after" ? 1 : 60;

    const newValue = mode === "inc" ? data + num : data - num;

    setData(newValue);

    const store = await load("settings.json", { autoSave: false });
    await store.set(SettingsData[type], newValue);
    await store.save();

    const val = await store.get<number>(SettingsData[type]);
    console.log(val);

    await invoke("apply_settings");
  };

  return (
    <>
      <div className="flex items-end justify-between">
        <span className="text-xs">{SettingRussian[setting]}</span>

        <div className="flex items-end gap-4">
          <div className="flex items-baseline gap-2 leading-none">
            <span>{setting === "after" ? data : data / 60}</span>

            <span className="text-xs text-foreground/50 ">
              {SettingUnits[setting]}
            </span>
          </div>

          <button
            className="cursor-pointer w-5 aspect-square"
            onClick={() => setIsActivate(true)}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </div>
      </div>

      {isActivate && (
        <SettingPopup
          hidePopup={() => setIsActivate(false)}
          setting={setting}
          initial={setting === "after" ? data : data / 60}
          change={changeSetting}
        />
      )}
    </>
  );
};
