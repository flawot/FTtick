export type Mode = "focus" | "short" | "long";

export const ModeRussian: Record<Mode, string> = {
  focus: "Фокус",
  short: "Перерыв",
  long: "Большой перерыв",
};

export interface BackendState {
  time: number;
  maxTime: number;
  mode: Mode;
  pomodoro: number;
  isRunning: boolean;
  longBreakAfter: number;
}