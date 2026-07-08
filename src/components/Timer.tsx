import { useEffect, useRef, useState } from "react";
import {
  EIGHT_HOURS_MS,
  FIFTEEN_MINUTES_MS,
  useTimer,
} from "../hooks/useTimer";
import type { PersistedAppState, PersistedTimerState } from "../types/appState";
import {
  playMainTimerEndSound,
  playSubTimerEndSound,
} from "../utils/playTimerEndSound";
import { playToggleSound } from "../utils/playToggleSound";
import TimerArc from "./TimerArc";
import TimerRound from "./TimerRound";
import "./Timer.scss";

type TimerProps = {
  initialMainTimer: PersistedTimerState;
  initialSubTimer: PersistedTimerState;
  initialSubTimerActive: boolean;
  onPersist: (
    state: Pick<PersistedAppState, "mainTimer" | "subTimer" | "isSubTimerActive">,
  ) => void;
};

function Timer({
  initialMainTimer,
  initialSubTimer,
  initialSubTimerActive,
  onPersist,
}: TimerProps) {
  const mainTimer = useTimer({
    totalMs: EIGHT_HOURS_MS,
    allowOverrun: true,
    autoStart: false,
    initialState: initialMainTimer,
  });
  const subTimer = useTimer({
    totalMs: FIFTEEN_MINUTES_MS,
    autoStart: false,
    initialState: initialSubTimer,
  });
  const [isSubTimerActive, setIsSubTimerActive] = useState(initialSubTimerActive);
  const previousMainRemainingMsRef = useRef(mainTimer.remainingMs);
  const previousSubFinishedRef = useRef(subTimer.isFinished);

  useEffect(() => {
    onPersist({
      mainTimer: mainTimer.getPersistedState(),
      subTimer: subTimer.getPersistedState(),
      isSubTimerActive,
    });
  }, [
    isSubTimerActive,
    mainTimer.isRunning,
    mainTimer.remainingMs,
    onPersist,
    subTimer.isRunning,
    subTimer.remainingMs,
  ]);

  useEffect(() => {
    if (subTimer.isFinished) {
      setIsSubTimerActive(false);
    }
  }, [subTimer.isFinished]);

  useEffect(() => {
    if (
      previousMainRemainingMsRef.current > 0 &&
      mainTimer.remainingMs <= 0
    ) {
      playMainTimerEndSound();
    }

    previousMainRemainingMsRef.current = mainTimer.remainingMs;
  }, [mainTimer.remainingMs]);

  useEffect(() => {
    if (!previousSubFinishedRef.current && subTimer.isFinished) {
      playSubTimerEndSound();
    }

    previousSubFinishedRef.current = subTimer.isFinished;
  }, [subTimer.isFinished]);

  const handle15Click = () => {
    playToggleSound();

    if (isSubTimerActive) {
      setIsSubTimerActive(false);
      subTimer.clear();
      return;
    }

    setIsSubTimerActive(true);
    subTimer.reset();

    if (!mainTimer.isRunning) {
      subTimer.togglePause();
    }
  };

  const handleTogglePause = () => {
    playToggleSound();

    const willPause = mainTimer.isRunning;

    mainTimer.togglePause();

    if (!isSubTimerActive) {
      return;
    }

    if (willPause && subTimer.isRunning) {
      subTimer.togglePause();
      return;
    }

    if (!willPause && subTimer.isPaused) {
      subTimer.togglePause();
    }
  };

  const handleReset = () => {
    playToggleSound();

    mainTimer.reset();
    setIsSubTimerActive(false);
    subTimer.clear();
  };

  return (
    <div className="timer" data-tauri-drag-region>
      <TimerRound
        mainTime={mainTimer.formattedTime}
        subTime={subTimer.formattedTime}
        showSubTimer={isSubTimerActive}
      >
        <TimerArc
          progress={mainTimer.progress}
          radius={60}
          strokeWidth={40}
          stroke="#E1FF00"
          viewBoxSize={164}
        />
        {isSubTimerActive && (
          <TimerArc
            progress={subTimer.progress}
            radius={55}
            strokeWidth={10}
            stroke="#ff0084"
            viewBoxSize={140}
          />
        )}
      </TimerRound>
      <button
        type="button"
        className={`timer-15-btn${isSubTimerActive ? " is-active" : ""}`}
        aria-pressed={isSubTimerActive}
        onClick={handle15Click}
      >
        15
      </button>
      <button
        type="button"
        className="timer-reset-btn"
        onClick={handleReset}
      >
        RESET
      </button>
      <button
        type="button"
        className="timer-pause-btn"
        onClick={handleTogglePause}
      >
        <span className="timer-pause-btn__label">
          {mainTimer.isRunning ? "PAUSE" : "PLAY"}
        </span>
      </button>
    </div>
  );
}

export default Timer;
