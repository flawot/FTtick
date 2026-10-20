import { invoke } from "@tauri-apps/api/core";
import { useLayoutEffect, useState } from "react";
import { Setting } from "./Setting";
import { SettingsState } from "../../../Shared/model/types";

export const TimeSettings = () => {
  const [settings, setSettings] = useState<SettingsState | null>(null);

  useLayoutEffect(() => {
    invoke<SettingsState>("get_settings")
      .then(setSettings)
      .catch(console.error);
  }, []);

  if (!settings) {
    return <div className="absolute top-15 w-full" />;
  }

  return (
    <div className="absolute top-15 w-full flex flex-col gap-2 px-2">
      <Setting setting="focus" value={settings.focus} />
      <Setting setting="short" value={settings.shortBreak} />
      <Setting setting="long" value={settings.longBreak} />
      <Setting setting="after" value={settings.longBreakAfter} />
    </div>
  );
};
