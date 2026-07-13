import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

const APP_NAME = "8hours";

let permissionPromise: Promise<boolean> | null = null;

/** 通知の許可状態を確認し、未許可なら要求する。結果はキャッシュして再要求しない */
export function ensureNotificationPermission(): Promise<boolean> {
  if (!permissionPromise) {
    permissionPromise = (async () => {
      try {
        if (await isPermissionGranted()) {
          return true;
        }
        return (await requestPermission()) === "granted";
      } catch {
        return false;
      }
    })();
  }

  return permissionPromise;
}

/** OS通知を送る。許可が無い/取得に失敗した場合は何もしない */
export function notify(body: string, title: string = APP_NAME): void {
  void ensureNotificationPermission().then((granted) => {
    if (!granted) {
      return;
    }

    try {
      sendNotification({ title, body });
    } catch {
      // 通知の送信に失敗しても、タイマー本体の動作には影響させない
    }
  });
}
