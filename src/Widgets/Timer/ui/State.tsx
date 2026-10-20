import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee, faEye } from "@fortawesome/free-solid-svg-icons";
import { format } from "../lib/format";
import { Progress } from "./Progress";
import { Mode, ModeRussian } from "../../../Shared/model/types";

interface IProps {
  maxTime: number;
  currentTime: number;
  mode: Mode;
  pomodoro: number;
  longBreakAfter: number;
}

export const State = ({ currentTime, maxTime, mode, pomodoro, longBreakAfter }: IProps) => {
  const pomodoros = [...Array(longBreakAfter).keys()];

  return (
    <div className="flex justify-center items-center relative">
      <FontAwesomeIcon
        icon={mode == "focus" ? faEye : faCoffee}
        className="text-xl absolute top-1/5"
      />

      <span className="font-ui absolute text-5xl min-[320px]:text-7xl top-2/6 font-semibold tabular-nums">
        {format(currentTime)}
      </span>

      <div className="absolute top-3/5 flex items-center gap-2">
        {pomodoros.map((i) => (
          <div
            key={i}
            className={`h-4 rounded-2xl w-1 duration-300 transition-colors ${i <= pomodoro ? "bg-primary" : "bg-surface"}`}
          />
        ))}
      </div>

      <span className="absolute leading-tight min-[320px]:text-lg max-w-1/2 text-center top-5/7 text-foreground/50 font-display">
        {ModeRussian[mode]}
      </span>

      <Progress
        percentage={currentTime / maxTime}
        size={window.innerWidth * 0.7}
        strokeWidth={8}
        mode={mode}
      />
    </div>
  );
};
