use std::sync::{Arc, Mutex};
use tauri::Manager;
use tauri_plugin_store::StoreExt;

mod audio;
mod timer;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_resizable(false);
            }

            let mut focus_time = 1500;
            let mut long_break_after = 4;

            if let Ok(store) = app.store("settings.json") {
                if let Some(focus_val) = store.get("focus").and_then(|v| v.as_u64()) {
                    focus_time = focus_val;
                }
                if let Some(lba_val) = store.get("longBreakAfter").and_then(|v| v.as_u64()) {
                    long_break_after = lba_val as u8;
                }
            }

            let timer_state = app.state::<timer::TimerState>();
            if let Ok(mut data) = timer_state.data.lock() {
                data.time = focus_time;
                data.max_time = focus_time;
                data.long_break_after = long_break_after;
            }

            Ok(())
        })
        .manage(timer::TimerState {
            data: Arc::new(Mutex::new(timer::TimerData {
                time: 1500,
                max_time: 1500,
                mode: timer::Mode::Focus,
                pomodoro: 0,
                is_running: false,
                long_break_after: 4,
            })),
        })
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            timer::start_pomodoro,
            timer::stop_pomodoro,
            timer::reset_pomodoro,
            timer::get_timer_state
        ]);

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {}));
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
