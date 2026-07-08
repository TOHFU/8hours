import { useCallback, useEffect, useRef, useState } from "react";

export const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
export const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export function formatTime(ms: number): string {
  const sign = ms < 0 ? "-" : "";
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    sign +
    [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
      .join(":")
  );
}

function getRemainingFromDeadline(
  endTimeMs: number,
  allowOverrun: boolean,
): number {
  const remainingMs = endTimeMs - Date.now();
  return allowOverrun ? remainingMs : Math.max(0, remainingMs);
}

export type TimerInitialState = {
  remainingMs: number;
  isRunning: boolean;
  endTimeMs?: number | null;
};

function resolveInitialTimerState(
  totalMs: number,
  autoStart: boolean,
  allowOverrun: boolean,
  initialState?: TimerInitialState,
): {
  endTimeMs: number | null;
  remainingMs: number;
  isRunning: boolean;
} {
  if (initialState) {
    const { remainingMs, isRunning, endTimeMs = null } = initialState;

    if (isRunning && endTimeMs !== null) {
      return {
        endTimeMs,
        remainingMs: getRemainingFromDeadline(endTimeMs, allowOverrun),
        isRunning: true,
      };
    }

    return {
      endTimeMs: null,
      remainingMs,
      isRunning: false,
    };
  }

  return {
    endTimeMs: autoStart ? Date.now() + totalMs : null,
    remainingMs: totalMs,
    isRunning: autoStart,
  };
}

type UseTimerOptions = {
  totalMs?: number;
  autoStart?: boolean;
  allowOverrun?: boolean;
  initialState?: TimerInitialState;
};

export function useTimer({
  totalMs = EIGHT_HOURS_MS,
  autoStart = true,
  allowOverrun = false,
  initialState,
}: UseTimerOptions = {}) {
  const initialTimerState = resolveInitialTimerState(
    totalMs,
    autoStart,
    allowOverrun,
    initialState,
  );
  const endTimeMsRef = useRef<number | null>(initialTimerState.endTimeMs);
  const [remainingMs, setRemainingMs] = useState(initialTimerState.remainingMs);
  const [isRunning, setIsRunning] = useState(initialTimerState.isRunning);

  const syncFromDeadline = useCallback(() => {
    const endTimeMs = endTimeMsRef.current;
    if (endTimeMs === null) {
      return;
    }

    const nextRemainingMs = getRemainingFromDeadline(endTimeMs, allowOverrun);
    setRemainingMs(nextRemainingMs);

    if (!allowOverrun && nextRemainingMs === 0) {
      endTimeMsRef.current = null;
      setIsRunning(false);
    }
  }, [allowOverrun]);

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
      setRemainingMs(
        getRemainingFromDeadline(endTimeMsRef.current, allowOverrun),
      );
      endTimeMsRef.current = null;
      setIsRunning(false);
      return;
    }

    setRemainingMs((currentRemainingMs) => {
      if (allowOverrun || currentRemainingMs > 0) {
        endTimeMsRef.current = Date.now() + currentRemainingMs;
        setIsRunning(true);
      }

      return currentRemainingMs;
    });
  }, [allowOverrun]);

  const getPersistedState = useCallback((): TimerInitialState & { endTimeMs: number | null } => {
    const endTimeMs = endTimeMsRef.current;

    if (endTimeMs !== null) {
      return {
        remainingMs: getRemainingFromDeadline(endTimeMs, allowOverrun),
        isRunning: true,
        endTimeMs,
      };
    }

    return {
      remainingMs,
      isRunning: false,
      endTimeMs: null,
    };
  }, [allowOverrun, remainingMs]);

  return {
    remainingMs,
    progress: remainingMs / totalMs,
    formattedTime: formatTime(remainingMs),
    isRunning,
    isPaused: !isRunning && (allowOverrun || remainingMs > 0),
    isFinished: allowOverrun ? remainingMs <= 0 : remainingMs === 0,
    reset,
    clear,
    togglePause,
    getPersistedState,
  };
}
