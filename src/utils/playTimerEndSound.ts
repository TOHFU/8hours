import Snd from "snd-lib";
import { playSound } from "../lib/snd";

function playSoundRepeatedly(soundKey: string, remainingCount: number): void {
  playSound(soundKey, {
    callback: () => {
      if (remainingCount > 1) {
        playSoundRepeatedly(soundKey, remainingCount - 1);
      }
    },
  });
}

export function playMainTimerEndSound(): void {
  playSoundRepeatedly(Snd.SOUNDS.RINGTONE_LOOP, 4);
}

export function playSubTimerEndSound(): void {
  playSound(Snd.SOUNDS.RINGTONE_LOOP);
}
