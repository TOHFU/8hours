import type Snd from "snd-lib";
import snd01Json from "snd-lib/dist/json/01.json";
import { getSoundKit } from "./sndKitInternal";

const LOCAL_AUDIO_SRC = "/sounds/snd01/audioSprite.mp3";

export function preloadSndKit(snd: Snd): Promise<void> {
  const { _audioSrc } = getSoundKit(snd);

  return _audioSrc.load(LOCAL_AUDIO_SRC, snd01Json).then(() => _audioSrc.analyze());
}
