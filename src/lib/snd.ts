import Snd from "snd-lib";
import { preloadSndKit, SND01_KIT } from "./preloadSndKit";

export const snd = new Snd({
  preloadSoundKit: null,
  muteOnWindowBlur: false,
});

const sndReady = preloadSndKit(snd, SND01_KIT);

type SndPlayOptions = Parameters<Snd["play"]>[1];

export function playSound(soundKey: string, options?: SndPlayOptions): void {
  void sndReady.then(() => {
    snd.play(soundKey, options);
  });
}
