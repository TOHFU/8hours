import { alertSnd } from "./sndAlert";
import { snd } from "./snd";

let isMuted = false;

function applyMuteState(muted: boolean): void {
  if (muted) {
    snd.mute();
    alertSnd.mute();
    return;
  }

  snd.unmute();
  alertSnd.unmute();
}

export function isSoundMuted(): boolean {
  return isMuted;
}

export function setSoundMuted(muted: boolean): void {
  isMuted = muted;
  applyMuteState(muted);
}

export function toggleSoundMuted(): boolean {
  const next = !isMuted;
  setSoundMuted(next);
  return next;
}
