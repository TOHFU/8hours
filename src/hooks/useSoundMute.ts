import { useCallback, useState } from "react";
import { setSoundMuted } from "../lib/soundMute";

export function useSoundMute() {
  const [isMuted, setIsMuted] = useState(false);

  const toggle = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setSoundMuted(next);
      return next;
    });
  }, []);

  return { isMuted, toggle };
}
