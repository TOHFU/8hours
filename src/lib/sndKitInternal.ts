import type Snd from "snd-lib";
import audioSource from "snd-lib/dist/audioSource";

export type PlayOptions = {
  index?: number | null;
  loop?: boolean;
  volume?: number;
  delay?: number;
  duration?: number;
  callback?: (id: number) => void;
};

export const DEFAULT_PLAY_OPTIONS: Required<PlayOptions> = {
  index: null,
  loop: false,
  volume: 1,
  delay: 0,
  duration: -1,
  callback: () => {},
};

type SndSoundKit = {
  play: (key: string, options: Required<PlayOptions>) => void;
  _audioSrc: {
    load: (audioSrc: string, json: unknown) => Promise<void>;
    analyze: () => Promise<void>;
  };
};

type SndInternal = {
  _soundKit: SndSoundKit;
};

type AudioSourceStatic = {
  _ctx: AudioContext | null;
  isActive: boolean;
  activate: () => void;
};

const AudioSource = audioSource as unknown as AudioSourceStatic;

export function getSoundKit(snd: Snd): SndSoundKit {
  return (snd as unknown as SndInternal)._soundKit;
}

export async function resumeSndAudioContext(): Promise<void> {
  if (!AudioSource.isActive) {
    try {
      AudioSource.activate();
    } catch {
      return;
    }
  }

  const ctx = AudioSource._ctx;
  if (!ctx) return;

  const state = ctx.state as AudioContextState | "interrupted";
  if (state === "suspended" || state === "interrupted") {
    await ctx.resume();
  }
}
