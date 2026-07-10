import Snd from "snd-lib";
import { preloadSndKit, SND02_KIT } from "./preloadSndKit";
import {
  DEFAULT_PLAY_OPTIONS,
  getSoundKit,
  resumeSndAudioContext,
  type PlayOptions,
} from "./sndKitInternal";

export const alertSnd = new Snd({
  preloadSoundKit: null,
  muteOnWindowBlur: false,
});

const alertSndReady = preloadSndKit(alertSnd, SND02_KIT);

/** タイマー完了など、ウィンドウ非フォーカス時でも鳴らす必要がある音用（snd02） */
export function playAlertSound(soundKey: string, options?: PlayOptions): void {
  void alertSndReady.then(async () => {
    await resumeSndAudioContext();
    getSoundKit(alertSnd).play(soundKey, { ...DEFAULT_PLAY_OPTIONS, ...options });
  });
}
