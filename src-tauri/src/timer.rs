use crate::audio;
use serde::Serialize;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{Emitter, State};

#[derive(Serialize, Clone, Copy, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Mode {
    Focus,
    Short,
    Long,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TimerData {
    pub time: u64,
    pub max_time: u64,
    pub mode: Mode,
    pub pomodoro: u32,
    pub is_running: bool,
    pub long_break_after: u8,
}

pub struct TimerState {
    pub data: Arc<Mutex<TimerData>>,
}

const LONG_BREAK_AFTER: u32 = 4;
const FOCUS_TIME: u64 = 25 * 60;
const SHORT_BREAK: u64 = 5 * 60;
const LONG_BREAK: u64 = 30 * 60;

#[tauri::command]
pub fn get_timer_state(state: State<'_, TimerState>) -> TimerData {
    let data = state.data.lock().unwrap();
    data.clone()
}

#[tauri::command]
pub fn start_pomodoro(seconds: u64, app_handle: tauri::AppHandle, state: State<'_, TimerState>) {
    let data_clone = state.data.clone();

    {
        let mut data = data_clone.lock().unwrap();
        if data.is_running {
            return;
        }
        data.is_running = true;
        data.time = seconds;
        data.max_time = seconds;

        let _ = app_handle.emit("timer-state-changed", data.clone());
    }

    std::thread::spawn(move || {
        loop {
            let current_time = {
                let data = data_clone.lock().unwrap();
                data.time
            };

            if current_time == 0 {
                break;
            }

            let start_time = Instant::now();

            let new_time = {
                let mut data = data_clone.lock().unwrap();
                if data.time > 0 {
                    data.time -= 1;
                }
                data.time
            };

            let _ = app_handle.emit("timer-tick", new_time);

            while start_time.elapsed() < Duration::from_secs(1) {
                if !data_clone.lock().unwrap().is_running {
                    return;
                }
                std::thread::sleep(Duration::from_millis(20));
            }
        }

        let mut data = data_clone.lock().unwrap();
        if data.is_running {
            audio::play_alarm();

            match data.mode {
                Mode::Focus => {
                    data.pomodoro += 1;
                    if data.pomodoro >= LONG_BREAK_AFTER {
                        data.mode = Mode::Long;
                        data.time = LONG_BREAK;
                        data.max_time = LONG_BREAK;
                    } else {
                        data.mode = Mode::Short;
                        data.time = SHORT_BREAK;
                        data.max_time = SHORT_BREAK;
                    }
                }
                Mode::Short | Mode::Long => {
                    if let Mode::Long = data.mode {
                        data.pomodoro = 0;
                    }
                    data.mode = Mode::Focus;
                    data.time = FOCUS_TIME;
                    data.max_time = FOCUS_TIME;
                }
            }

            data.is_running = false;

            let _ = app_handle.emit("timer-state-changed", data.clone());
        }
    });
}

#[tauri::command]
pub fn stop_pomodoro(app_handle: tauri::AppHandle, state: State<'_, TimerState>) {
    let mut data = state.data.lock().unwrap();
    data.is_running = false;
    let _ = app_handle.emit("timer-state-changed", data.clone());
}

#[tauri::command]
pub fn reset_pomodoro(app_handle: tauri::AppHandle, state: State<'_, TimerState>) -> TimerData {
    let mut data = state.data.lock().unwrap();
    data.is_running = false;
    data.pomodoro = 0;
    data.mode = Mode::Focus;
    data.time = FOCUS_TIME;
    data.max_time = FOCUS_TIME;
    data.long_break_after = LONG_BREAK_AFTER as u8;

    let _ = app_handle.emit("timer-state-changed", data.clone());
    data.clone()
}
