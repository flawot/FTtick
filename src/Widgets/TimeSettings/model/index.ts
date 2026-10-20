export type SettingType = "focus" | "short" | "long" | "after";

export const SettingRussian: Record<SettingType, string> = {
  focus: "Фокус",
  after: "Большой отдых после",
  short: "Отдых",
  long: "Большой отдых",
};

export const SettingUnits: Record<SettingType, string> = {
  focus: "мин",
  short: "мин",
  long: "мин",
  after: "циклов",
};

export const SettingsData: Record<SettingType, string> = {
  focus: "focus",
  short: "shortBreak",
  long: "longBreak",
  after: "longBreakAfter",
};
