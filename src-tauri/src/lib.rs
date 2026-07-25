#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            use tauri::{
                image::Image,
                menu::{Menu, MenuItem},
                tray::TrayIconBuilder,
            };

            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;
            
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
                        .on_menu_event(|app, event| match event.id.as_ref() {
                            "quit" => {
                                app.exit(0);
                            }
                            _ => {
                                println!("menu item {:?} not handled", event.id);
                            }
                        })
                        .build(app)?;
                } else {
                    eprintln!("Failed to load tray icon from {:?}", path);
                }
            }
            
            Ok(())
        })
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
