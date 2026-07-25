use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub main_remaining_ms: u64,
    pub sub_remaining_ms: u64,
}

impl Default for TimerState {
    fn default() -> Self {
        TimerState {
            main_remaining_ms: 32400000, // 9 hours in ms
            sub_remaining_ms: 0,
        }
    }
}

pub struct AppStateManager {
    pub timer_state: Arc<Mutex<TimerState>>,
    pub dock_icon_visible: Arc<Mutex<bool>>,
}

impl Default for AppStateManager {
    fn default() -> Self {
        AppStateManager {
            timer_state: Arc::new(Mutex::new(TimerState::default())),
            dock_icon_visible: Arc::new(Mutex::new(true)),
        }
    }
}

#[cfg(target_os = "macos")]
fn toggle_dock_icon(show: bool) {
    use objc2::class;
    use objc2::msg_send;
    use objc2::runtime::AnyObject;

    unsafe {
        let app: *mut AnyObject = msg_send![class!(NSApplication), sharedApplication];
        if show {
            let _: () = msg_send![app, setActivationPolicy: 0]; // NSApplicationActivationPolicyRegular
        } else {
            let _: () = msg_send![app, setActivationPolicy: 1]; // NSApplicationActivationPolicyAccessory
        }
    }
}

#[cfg(not(target_os = "macos"))]
fn toggle_dock_icon(_show: bool) {}

#[allow(dead_code)]
fn format_time(ms: u64) -> String {
    let total_seconds = ms / 1000;
    let hours = total_seconds / 3600;
    let minutes = (total_seconds % 3600) / 60;
    let seconds = total_seconds % 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

#[tauri::command]
fn update_timer_state(
    state: tauri::State<AppStateManager>,
    main_remaining_ms: u64,
    sub_remaining_ms: u64,
) -> Result<(), String> {
    let mut timer_state = state.timer_state.lock().map_err(|e| e.to_string())?;
    timer_state.main_remaining_ms = main_remaining_ms;
    timer_state.sub_remaining_ms = sub_remaining_ms;
    Ok(())
}

#[tauri::command]
fn toggle_show_dock_icon(
    state: tauri::State<AppStateManager>,
    show: bool,
) -> Result<(), String> {
    toggle_dock_icon(show);
    let mut dock_visible = state.dock_icon_visible.lock().map_err(|e| e.to_string())?;
    *dock_visible = show;
    Ok(())
}

#[tauri::command]
fn get_dock_icon_visibility(
    state: tauri::State<AppStateManager>,
) -> Result<bool, String> {
    let dock_visible = state.dock_icon_visible.lock().map_err(|e| e.to_string())?;
    Ok(*dock_visible)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppStateManager::default())
        .setup(|app| {
            use tauri::{
                image::Image,
                menu::{Menu, MenuItem},
                tray::TrayIconBuilder,
                Manager,
            };

            let _app_state: tauri::State<AppStateManager> = app.state();

            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let toggle_dock = MenuItem::with_id(app, "toggle_dock", "✓ Show/Hide Dock Icon", true, None::<&str>)?;
            
            let menu = Menu::with_items(app, &[
                &toggle_dock,
                &quit_i,
            ])?;
            
            // Build the resource path for the tray icon
            let resource_path = std::env::current_exe()
                .ok()
                .and_then(|mut p| {
                    p.pop(); // Remove executable name
                    p.pop(); // Remove MacOS directory
                    Some(p.join("Resources").join("tray.png"))
                })
                .or_else(|| {
                    // Fallback for development: try relative path from src-tauri
                    Some(std::path::PathBuf::from("tray.png"))
                });

            if let Some(path) = resource_path {
                if let Ok(image) = Image::from_path(&path) {
                    let _tray = TrayIconBuilder::new()
                        .icon(image)
                        .menu(&menu)
                        .show_menu_on_left_click(true)
                        .on_menu_event(|app, event| {
                            let state: tauri::State<AppStateManager> = app.state();
                            match event.id.as_ref() {
                                "quit" => {
                                    app.exit(0);
                                }
                                "toggle_dock" => {
                                    if let Ok(mut dock_visible) = state.dock_icon_visible.lock() {
                                        let new_state = !*dock_visible;
                                        toggle_dock_icon(new_state);
                                        *dock_visible = new_state;
                                    }
                                }
                                _ => {}
                            }
                        })
                        .build(app)?;
                } else {
                    eprintln!("Failed to load tray icon from {:?}", path);
                }
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            update_timer_state,
            toggle_show_dock_icon,
            get_dock_icon_visibility
        ])
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
