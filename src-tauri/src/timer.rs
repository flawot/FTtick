use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{Emitter, State};
use crate::audio;

pub struct TimerState {
    pub is_running: Arc<Mutex<bool>>,
}

#[tauri::command]
pub fn start_pomodoro(seconds: u64, app_handle: tauri::AppHandle, state: State<'_, TimerState>) {
    let is_running = state.is_running.clone();

    {
        let mut running = is_running.lock().unwrap();
        if *running { return; }
        *running = true;
    }

    std::thread::spawn(move || {
        let mut time_left = seconds;

        while time_left > 0 {
            let start_time = Instant::now();
            
            time_left -= 1;
            let _ = app_handle.emit("timer-tick", time_left);
            
            while start_time.elapsed() < Duration::from_secs(1) {
                if !*is_running.lock().unwrap() {
                    return;
                }
                std::thread::sleep(Duration::from_millis(20));
            }
        }

        let mut running = is_running.lock().unwrap();
        if *running {
            *running = false;
            audio::play_alarm();
            let _ = app_handle.emit("timer-finished", ());
        }
    });
}

#[tauri::command]
pub fn stop_pomodoro(state: State<'_, TimerState>) {
    let mut running = state.is_running.lock().unwrap();
    *running = false;
}
