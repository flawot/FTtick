use serde::Serialize;
use tauri_plugin_store::StoreExt;

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SettingsData {
    pub focus: u64,
    pub short_break: u64,
    pub long_break: u64,
    pub long_break_after: u8,
}

#[tauri::command]
pub fn get_settings(app_handle: tauri::AppHandle) -> SettingsData {
    let mut settings = SettingsData {
        focus: 25 * 60,
        short_break: 5 * 60,
        long_break: 30 * 60,
        long_break_after: 4,
    };

    if let Ok(store) = app_handle.store("settings.json") {
        if let Some(val) = store.get("focus").and_then(|v| v.as_u64()) {
            settings.focus = val;
        }
        if let Some(val) = store.get("shortBreak").and_then(|v| v.as_u64()) {
            settings.short_break = val;
        }
        if let Some(val) = store.get("longBreak").and_then(|v| v.as_u64()) {
            settings.long_break = val;
        }
        if let Some(val) = store.get("longBreakAfter").and_then(|v| v.as_u64()) {
            settings.long_break_after = val as u8;
        }
    }

    settings
}

pub fn load_timer_config(app_handle: &tauri::AppHandle) -> SettingsData {
    get_settings(app_handle.clone())
}
