const WINDOW_WIDTH = 219;
const MIN_WINDOW_HEIGHT = 366;

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function resizeWindowToHeight(height: number): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const { LogicalSize } = await import("@tauri-apps/api/dpi");

  await getCurrentWindow().setSize(
    new LogicalSize(WINDOW_WIDTH, Math.max(MIN_WINDOW_HEIGHT, Math.ceil(height))),
  );
}
