import Snd from "snd-lib";
import { preloadSndKit, SND01_KIT } from "./preloadSndKit";
import { resumeSndAudioContext } from "./sndKitInternal";

export const snd = new Snd({
  preloadSoundKit: null,
  muteOnWindowBlur: false,
});

const sndReady = preloadSndKit(snd, SND01_KIT);

type SndPlayOptions = Parameters<Snd["play"]>[1];

export function playSound(soundKey: string, options?: SndPlayOptions): void {
  void sndReady.then(async () => {
    // 長時間バックグラウンドに置かれるなどして AudioContext が suspended/interrupted に
    // なっていると、エラーも出さず無音のまま再生されてしまうため、先に再開を試みる
    await resumeSndAudioContext();
    snd.play(soundKey, options);
  });
}
