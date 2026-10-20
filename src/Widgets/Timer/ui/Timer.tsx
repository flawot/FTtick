import { useEffect, useState, useLayoutEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useNavigate } from "react-router";
import { State } from "./State";
import { IconButton } from "../../../Shared/ui/IconButton";
import { faGear, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { BackendState } from "../../../Shared/model/types";

export const Timer = () => {
  const [state, setState] = useState<BackendState | null>(null);
  const [key, setKey] = useState<number>(0);

  const navigate = useNavigate();

  useLayoutEffect(() => {
    invoke<BackendState>("get_timer_state").then(setState).catch(console.error);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let unlistenTick: (() => void) | undefined;
    let unlistenState: (() => void) | undefined;

    listen<number>("timer-tick", (e) => {
      if (!isCancelled) {
        setState((prev) => (prev ? { ...prev, time: e.payload } : null));
      }
    }).then((fn) => (unlistenTick = fn));

    listen<BackendState>("timer-state-changed", (e) => {
      if (!isCancelled) {
        setState(e.payload);
      }
    }).then((fn) => (unlistenState = fn));

    return () => {
      isCancelled = true;
      unlistenTick?.();
      unlistenState?.();
    };
  }, []);

  if (!state) {
    return <div className="w-full h-full bg-background" />;
  }

  const toggleState = () => {
    if (state.isRunning) {
      invoke("stop_pomodoro").catch(console.error);
    } else {
      invoke("start_pomodoro", { seconds: state.time }).catch(console.error);
    }
  };

  const resetTimer = async () => {
    try {
      const resetState = await invoke<BackendState>("reset_pomodoro");
      setState(resetState);
      setKey((prev) => prev + 1);
    } catch (error) {
      console.error("Ошибка при сбросе таймера:", error);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full relative flex flex-col items-center justify-between"
    >
      <State
        key={key}
        pomodoro={state.pomodoro}
        currentTime={state.time}
        maxTime={state.maxTime}
        mode={state.mode}
        longBreakAfter={state.longBreakAfter}
      />

      <button
        className="bg-surface min-[320px]:text-lg duration-100 hover:scale-110 active:scale-100 text-foreground font-display px-6 py-2 rounded-full"
        onClick={toggleState}
      >
        {state.isRunning ? "Пауза" : "Старт"}
      </button>

      <span className="absolute left-0 bottom-0">
        <IconButton icon={faRefresh} onClick={resetTimer} />
      </span>

      <span className="absolute right-0 bottom-0">
        <IconButton icon={faGear} onClick={() => navigate("/settings")} />
      </span>
    </div>
  );
};
