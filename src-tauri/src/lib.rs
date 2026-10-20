use std::sync::Mutex;
use tauri::Manager;

mod audio;
mod settings;
mod timer;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_resizable(false);
            }

            let config = settings::load_timer_config(app.handle());

            let timer_state = app.state::<timer::TimerState>();
            if let Ok(mut data) = timer_state.data.lock() {
                data.time = config.focus;
                data.max_time = config.focus;
                data.long_break_after = config.long_break_after;
            }

            Ok(())
        })
        .manage(timer::TimerState {
            data: Mutex::new(timer::TimerData {
                time: 25 * 60,
                max_time: 25 * 60,
                mode: timer::Mode::Focus,
                pomodoro: 0,
                is_running: false,
                long_break_after: 4,
            }),
        })
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            timer::start_pomodoro,
            timer::stop_pomodoro,
            timer::reset_pomodoro,
            timer::get_timer_state,
            timer::apply_settings,
            settings::get_settings
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
