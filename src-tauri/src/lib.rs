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
    pub tray_icon: Arc<Mutex<Option<tauri::tray::TrayIcon<tauri::Wry>>>>,
    pub dock_menu_item: Arc<Mutex<Option<tauri::menu::CheckMenuItem<tauri::Wry>>>>,
    pub main_timer_item: Arc<Mutex<Option<tauri::menu::MenuItem<tauri::Wry>>>>,
    pub sub_timer_item: Arc<Mutex<Option<tauri::menu::MenuItem<tauri::Wry>>>>,
}

impl Default for AppStateManager {
    fn default() -> Self {
        AppStateManager {
            timer_state: Arc::new(Mutex::new(TimerState::default())),
            dock_icon_visible: Arc::new(Mutex::new(true)),
            tray_icon: Arc::new(Mutex::new(None)),
            dock_menu_item: Arc::new(Mutex::new(None)),
            main_timer_item: Arc::new(Mutex::new(None)),
            sub_timer_item: Arc::new(Mutex::new(None)),
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
    {
        let mut timer_state = state.timer_state.lock().map_err(|e| e.to_string())?;
        timer_state.main_remaining_ms = main_remaining_ms;
        timer_state.sub_remaining_ms = sub_remaining_ms;
    }

    let main_text = format!("8h : {}", format_time(main_remaining_ms));
    let sub_text = format!("30m : {}", format_time(sub_remaining_ms));

    if let Ok(item_opt) = state.main_timer_item.lock() {
        if let Some(item) = item_opt.as_ref() {
            let _ = item.set_text(main_text);
        }
    }
    if let Ok(item_opt) = state.sub_timer_item.lock() {
        if let Some(item) = item_opt.as_ref() {
            let _ = item.set_text(sub_text);
        }
    }

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

#[tauri::command]
fn get_timer_display(
    state: tauri::State<AppStateManager>,
) -> Result<(String, String), String> {
    let timer_state = state.timer_state.lock().map_err(|e| e.to_string())?;
    let main_time = format_time(timer_state.main_remaining_ms);
    let sub_time = format_time(timer_state.sub_remaining_ms);
    Ok((main_time, sub_time))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppStateManager::default())
        .setup(|app| {
            use tauri::{
                image::Image,
                tray::TrayIconBuilder,
                Manager,
            };

            let app_state: tauri::State<AppStateManager> = app.state();

            let toggle_dock_item = tauri::menu::CheckMenuItem::with_id(
                app,
                "toggle_dock",
                "Show Dock Icon",
                true,
                true,
                None::<&str>,
            )?;
            let sep1 = tauri::menu::PredefinedMenuItem::separator(app)?;
            let main_timer_item = tauri::menu::MenuItem::with_id(
                app,
                "main_timer",
                "8h : --:--:--",
                true,
                None::<&str>,
            )?;
            let sub_timer_item = tauri::menu::MenuItem::with_id(
                app,
                "sub_timer",
                "30m : --:--:--",
                true,
                None::<&str>,
            )?;
            let sep2 = tauri::menu::PredefinedMenuItem::separator(app)?;
            let quit_i = tauri::menu::MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = tauri::menu::Menu::with_items(
                app,
                &[&toggle_dock_item, &sep1, &main_timer_item, &sub_timer_item, &sep2, &quit_i],
            )?;

            // Store menu item handles for direct updates
            {
                let mut item = app_state.dock_menu_item.lock().map_err(|e| e.to_string())?;
                *item = Some(toggle_dock_item);
            }
            {
                let mut item = app_state.main_timer_item.lock().map_err(|e| e.to_string())?;
                *item = Some(main_timer_item);
            }
            {
                let mut item = app_state.sub_timer_item.lock().map_err(|e| e.to_string())?;
                *item = Some(sub_timer_item);
            }

            // Build the resource path for the tray icon
            let resource_path = std::env::current_exe()
                .ok()
                .and_then(|mut p| {
                    p.pop(); // Remove executable name
                    p.pop(); // Remove MacOS directory
                    Some(p.join("Resources").join("tray.png"))
                })
                .or_else(|| {
                    Some(std::path::PathBuf::from("tray.png"))
                });

            if let Some(path) = resource_path {
                if let Ok(image) = Image::from_path(&path) {
                    let tray = TrayIconBuilder::new()
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
                                    let new_state = {
                                        let dock_visible = state.dock_icon_visible.lock().unwrap();
                                        !*dock_visible
                                    };

                                    // Update check state BEFORE changing dock policy
                                    if let Ok(item_opt) = state.dock_menu_item.lock() {
                                        if let Some(item) = item_opt.as_ref() {
                                            let _ = item.set_checked(new_state);
                                        }
                                    }

                                    // Change dock policy
                                    toggle_dock_icon(new_state);

                                    // Force re-enable the item after policy change
                                    // (accessory mode transition can disable menu items)
                                    if let Ok(item_opt) = state.dock_menu_item.lock() {
                                        if let Some(item) = item_opt.as_ref() {
                                            let _ = item.set_enabled(true);
                                        }
                                    }

                                    // Update state
                                    {
                                        let mut dock_visible = state.dock_icon_visible.lock().unwrap();
                                        *dock_visible = new_state;
                                    }
                                }
                                _ => {}
                            }
                        })
                        .build(app)?;

                    // Store tray handle in app state for later menu updates
                    let mut tray_state = app_state.tray_icon.lock().map_err(|e| e.to_string())?;
                    *tray_state = Some(tray);
                } else {
                    eprintln!("Failed to load tray icon from {:?}", path);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            update_timer_state,
            toggle_show_dock_icon,
            get_dock_icon_visibility,
            get_timer_display
        ])
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
