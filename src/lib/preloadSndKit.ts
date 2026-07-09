import type Snd from "snd-lib";
import snd01Json from "snd-lib/dist/json/01.json";

const LOCAL_AUDIO_SRC = "/sounds/snd01/audioSprite.mp3";

type SoundKitLoader = {
  _soundKit: {
    _audioSrc: {
      load: (audioSrc: string, json: unknown) => Promise<void>;
      analyze: () => Promise<void>;
    };
  };
};

export function preloadSndKit(snd: Snd): Promise<void> {
  const { _audioSrc } = (snd as unknown as SoundKitLoader)._soundKit;

  return _audioSrc.load(LOCAL_AUDIO_SRC, snd01Json).then(() => _audioSrc.analyze());
}
