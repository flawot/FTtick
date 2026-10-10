import { Mode } from "../model";

interface IProps {
  percentage?: number;
  size?: number;
  strokeWidth?: number;
  mode: Mode;
}

export const Progress = ({ percentage = 75, size = 120, strokeWidth = 10, mode }: IProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (1 - percentage) * circumference;

  return (
    <div className={`w-[${size}px] aspect-square relative`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="stroke-surface"
        />

        {/* key={mode} заставляет круг мгновенно пересоздаться при смене режима (сбросе) */}
        <circle
          key={mode}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="stroke-primary duration-1000 transition-all ease-linear"
        />
      </svg>
    </div>
  );
};