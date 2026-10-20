use crate::audio;
use crate::settings;
use serde::Serialize;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager, State};

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
    pub data: Mutex<TimerData>,
}

#[tauri::command]
pub fn get_timer_state(state: State<'_, TimerState>) -> TimerData {
    let data = state.data.lock().unwrap_or_else(|e| e.into_inner());
    data.clone()
}

#[tauri::command]
pub fn start_pomodoro(seconds: u64, app_handle: tauri::AppHandle, state: State<'_, TimerState>) {
    {
        let mut data = state.data.lock().unwrap_or_else(|e| e.into_inner());
        if data.is_running {
            return;
        }
        data.is_running = true;
        data.time = seconds;
        data.max_time = seconds;

        let _ = app_handle.emit("timer-state-changed", data.clone());
    }

    std::thread::spawn(move || {
        let state_ref = match app_handle.try_state::<TimerState>() {
            Some(s) => s,
            None => return,
        };

        loop {
            {
                let data = state_ref.data.lock().unwrap_or_else(|e| e.into_inner());
                if !data.is_running {
                    return;
                }
            }

            let start_time = Instant::now();

            let current_time = {
                let mut data = state_ref.data.lock().unwrap_or_else(|e| e.into_inner());
                if data.time > 0 {
                    data.time -= 1;
                }
                data.time
            };

            let _ = app_handle.emit("timer-tick", current_time);

            if current_time == 0 {
                break;
            }

            while start_time.elapsed() < Duration::from_secs(1) {
                let is_running = {
                    let data = state_ref.data.lock().unwrap_or_else(|e| e.into_inner());
                    data.is_running
                };

                if !is_running {
                    return;
                }
                std::thread::sleep(Duration::from_millis(20));
            }
        }

        let mut data = state_ref.data.lock().unwrap_or_else(|e| e.into_inner());
        if data.is_running {
            audio::play_alarm();

            let config = settings::load_timer_config(&app_handle);

            match data.mode {
                Mode::Focus => {
                    data.pomodoro += 1;
                    if data.pomodoro >= config.long_break_after as u32 {
                        data.mode = Mode::Long;
                        data.time = config.long_break;
                        data.max_time = config.long_break;
                    } else {
                        data.mode = Mode::Short;
                        data.time = config.short_break;
                        data.max_time = config.short_break;
                    }
                }
                Mode::Short | Mode::Long => {
                    if let Mode::Long = data.mode {
                        data.pomodoro = 0;
                    }
                    data.mode = Mode::Focus;
                    data.time = config.focus;
                    data.max_time = config.focus;
                }
            }

            data.long_break_after = config.long_break_after;
            data.is_running = false;

            let _ = app_handle.emit("timer-state-changed", data.clone());
        }
    });
}

#[tauri::command]
pub fn stop_pomodoro(app_handle: tauri::AppHandle, state: State<'_, TimerState>) {
    let mut data = state.data.lock().unwrap_or_else(|e| e.into_inner());
    data.is_running = false;
    let _ = app_handle.emit("timer-state-changed", data.clone());
}

#[tauri::command]
pub fn reset_pomodoro(app_handle: tauri::AppHandle, state: State<'_, TimerState>) -> TimerData {
    let config = settings::load_timer_config(&app_handle);

    let mut data = state.data.lock().unwrap_or_else(|e| e.into_inner());
    data.is_running = false;
    data.pomodoro = 0;
    data.mode = Mode::Focus;
    data.time = config.focus;
    data.max_time = config.focus;
    data.long_break_after = config.long_break_after;

    let _ = app_handle.emit("timer-state-changed", data.clone());
    data.clone()
}

#[tauri::command]
pub fn apply_settings(app_handle: tauri::AppHandle, state: State<'_, TimerState>) -> TimerData {
    let config = settings::load_timer_config(&app_handle);
    let mut data = state.data.lock().unwrap_or_else(|e| e.into_inner());

    data.long_break_after = config.long_break_after;

    if !data.is_running {
        match data.mode {
            Mode::Focus => {
                data.time = config.focus;
                data.max_time = config.focus;
            }
            Mode::Short => {
                data.time = config.short_break;
                data.max_time = config.short_break;
            }
            Mode::Long => {
                data.time = config.long_break;
                data.max_time = config.long_break;
            }
        }
    }

    let _ = app_handle.emit("timer-state-changed", data.clone());
    data.clone()
}
