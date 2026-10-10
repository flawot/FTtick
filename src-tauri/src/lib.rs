use std::sync::{Arc, Mutex};

mod audio;
mod timer;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .manage(timer::TimerState { 
            is_running: Arc::new(Mutex::new(false)) 
        })

        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            timer::start_pomodoro,
            timer::stop_pomodoro
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