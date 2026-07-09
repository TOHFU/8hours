import Snd from "snd-lib";
import { preloadSndKit } from "./preloadSndKit";

export const snd = new Snd({
  preloadSoundKit: null,
  muteOnWindowBlur: false,
});

const sndReady = preloadSndKit(snd);

type PlayOptions = Parameters<Snd["play"]>[1];

export function playSound(soundKey: string, options?: PlayOptions): void {
  void sndReady.then(() => {
    snd.play(soundKey, options);
  });
}
