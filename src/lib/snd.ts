import Snd from "snd-lib";
import { preloadSndKit } from "./preloadSndKit";
import {
  DEFAULT_PLAY_OPTIONS,
  getSoundKit,
  resumeSndAudioContext,
  type PlayOptions,
} from "./sndKitInternal";

export const snd = new Snd({
  preloadSoundKit: null,
  muteOnWindowBlur: false,
});

const sndReady = preloadSndKit(snd);

type SndPlayOptions = Parameters<Snd["play"]>[1];

export function playSound(soundKey: string, options?: SndPlayOptions): void {
  void sndReady.then(() => {
    snd.play(soundKey, options);
  });
}

/** タイマー完了など、ウィンドウ非フォーカス時でも鳴らす必要がある音用 */
export function playAlertSound(soundKey: string, options?: PlayOptions): void {
  void sndReady.then(async () => {
    await resumeSndAudioContext();
    getSoundKit(snd).play(soundKey, { ...DEFAULT_PLAY_OPTIONS, ...options });
  });
}
