import { notify } from "../lib/notify";

export function notifyMainTimerEnd(): void {
  notify("8時間経過しました。");
}

export function notifySubTimerBreak(): void {
  notify("25分間、お疲れ様でした。");
}

export function notifySubTimerEnd(): void {
  notify("30分経過しました。");
}
