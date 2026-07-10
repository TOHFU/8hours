import type Snd from "snd-lib";
import snd01Json from "snd-lib/dist/json/01.json";
import snd02Json from "snd-lib/dist/json/02.json";
import { getSoundKit } from "./sndKitInternal";

export type SndKitConfig = {
  audioSrc: string;
  json: unknown;
};

export const SND01_KIT: SndKitConfig = {
  audioSrc: "/sounds/snd01/audioSprite.mp3",
  json: snd01Json,
};

export const SND02_KIT: SndKitConfig = {
  audioSrc: "/sounds/snd02/audioSprite.mp3",
  json: snd02Json,
};

export function preloadSndKit(
  snd: Snd,
  kit: SndKitConfig = SND01_KIT,
): Promise<void> {
  const { _audioSrc } = getSoundKit(snd);

  return _audioSrc.load(kit.audioSrc, kit.json).then(() => _audioSrc.analyze());
}
