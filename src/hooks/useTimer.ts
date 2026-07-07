import { useCallback, useEffect, useRef, useState } from "react";

export const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
export const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function getRemainingFromDeadline(endTimeMs: number): number {
  return Math.max(0, endTimeMs - Date.now());
}

type UseTimerOptions = {
  totalMs?: number;
  autoStart?: boolean;
};

export function useTimer({
  totalMs = EIGHT_HOURS_MS,
  autoStart = true,
}: UseTimerOptions = {}) {
  const endTimeMsRef = useRef<number | null>(
    autoStart ? Date.now() + totalMs : null,
  );
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [isRunning, setIsRunning] = useState(autoStart);

  const syncFromDeadline = useCallback(() => {
    const endTimeMs = endTimeMsRef.current;
    if (endTimeMs === null) {
      return;
    }

    const nextRemainingMs = getRemainingFromDeadline(endTimeMs);
    setRemainingMs(nextRemainingMs);

    if (nextRemainingMs === 0) {
      endTimeMsRef.current = null;
      setIsRunning(false);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    syncFromDeadline();

    const intervalId = window.setInterval(syncFromDeadline, 1000);

    const handleResume = () => {
      syncFromDeadline();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncFromDeadline();
      }
    };

    window.addEventListener("focus", handleResume);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleResume);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, syncFromDeadline]);

  const reset = useCallback(() => {
    endTimeMsRef.current = Date.now() + totalMs;
    setRemainingMs(totalMs);
    setIsRunning(true);
  }, [totalMs]);

  const clear = useCallback(() => {
    endTimeMsRef.current = null;
    setRemainingMs(totalMs);
    setIsRunning(false);
  }, [totalMs]);

  const togglePause = useCallback(() => {
    if (endTimeMsRef.current !== null) {
      setRemainingMs(getRemainingFromDeadline(endTimeMsRef.current));
      endTimeMsRef.current = null;
      setIsRunning(false);
      return;
    }

    setRemainingMs((currentRemainingMs) => {
      if (currentRemainingMs > 0) {
        endTimeMsRef.current = Date.now() + currentRemainingMs;
        setIsRunning(true);
      }

      return currentRemainingMs;
    });
  }, []);

  return {
    remainingMs,
    progress: remainingMs / totalMs,
    formattedTime: formatTime(remainingMs),
    isRunning,
    isPaused: !isRunning && remainingMs > 0,
    isFinished: remainingMs === 0,
    reset,
    clear,
    togglePause,
  };
}
