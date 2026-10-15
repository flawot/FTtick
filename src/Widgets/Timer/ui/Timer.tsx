import { useEffect, useState, useRef } from "react";
import { focus, shortBreak, longBreak, longBreakAfter } from "../config";
import { State } from "./State";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Mode } from "../model";
import { IconButton } from "../../../Shared/ui/IconButton";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

export const Timer = () => {
  const [time, setTime] = useState<number>(focus);
  const [active, setActive] = useState<boolean>(false);
  const [pomodoro, setPomodoro] = useState<number>(0);
  const [mode, setMode] = useState<Mode>("focus");
  const [maxTime, setMaxTime] = useState<number>(focus);
  const [key, setKey] = useState<number>(0);

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const startTimer = (seconds: number, newMode: Mode) => {
    setTime(seconds);
    setMaxTime(seconds);
    setMode(newMode);
    setActive(true);
    invoke("start_pomodoro", { seconds }).catch(console.error);
  };

  useEffect(() => {
    let isCancelled = false;
    let unlistenTick: (() => void) | undefined;
    let unlistenFinished: (() => void) | undefined;

    listen<number>(
      "timer-tick",
      (e) => !isCancelled && setTime(e.payload),
    ).then((fn) => {
      if (isCancelled) fn();
      else unlistenTick = fn;
    });

    listen("timer-finished", () => {
      if (isCancelled) return;

      if (modeRef.current === "focus") {
        setPomodoro((prev) => {
          const next = prev + 1;
          if (next >= longBreakAfter) {
            startTimer(longBreak, "long");
          } else {
            startTimer(shortBreak, "short");
          }
          return next;
        });
      } else {
        if (modeRef.current === "long") {
          setPomodoro(0);
          setTime(focus);
          setMaxTime(focus);
          setMode("focus");
          setActive(false);
          invoke("stop_pomodoro").catch(console.error);
        } else {
          startTimer(focus, "focus");
        }
      }
    }).then((fn) => {
      if (isCancelled) fn();
      else unlistenFinished = fn;
    });

    return () => {
      isCancelled = true;
      unlistenTick?.();
      unlistenFinished?.();
    };
  }, []);

  const toggleState = () => {
    const nextActive = !active;
    setActive(nextActive);
    invoke(
      nextActive ? "start_pomodoro" : "stop_pomodoro",
      nextActive ? { seconds: time } : undefined,
    ).catch(console.error);
  };

  const resetTimer = () => {
    invoke("stop_pomodoro").catch(console.error);
    setPomodoro(0);
    setMode("focus");
    setMaxTime(focus);
    setTime(focus);
    setActive(false);
    setKey((prev) => prev + 1);
  };

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full relative flex flex-col items-center justify-between"
    >
      <State
        key={key}
        pomodoro={pomodoro}
        currentTime={time}
        maxTime={maxTime}
        mode={mode}
      />

      <button
        className="bg-surface min-[320px]:text-lg duration-100 hover:scale-110 active:scale-100 text-foreground font-display px-6 py-2 rounded-full"
        onClick={toggleState}
      >
        {active ? "Пауза" : "Старт"}
      </button>

      <span className="absolute left-4 bottom-4">
        <IconButton icon={faRefresh} onClick={() => resetTimer()} />
      </span>
    </div>
  );
};
