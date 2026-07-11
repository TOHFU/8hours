import { useEffect, useState } from "react";
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
import { useSoundMute } from "../hooks/useSoundMute";
import { playToggleOffSound, playToggleOnSound, playToggleSound } from "../utils/playToggleSound";
import Timer15Button from "./Timer15Button";
import TimerArc from "./TimerArc";
import TimerPauseButton from "./TimerPauseButton";
import TimerResetButton from "./TimerResetButton";
import TimerRound from "./TimerRound";
import TimerSoundButton from "./TimerSoundButton";
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
    onNaturalZeroCross: playMainTimerEndSound,
  });
  const subTimer = useTimer({
    totalMs: FIFTEEN_MINUTES_MS,
    autoStart: false,
    initialState: initialSubTimer,
    onNaturalZeroCross: playSubTimerEndSound,
  });
  const [isSubTimerActive, setIsSubTimerActive] = useState(initialSubTimerActive);
  const { isMuted, toggle: toggleSoundMute } = useSoundMute();

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

  const handle15Click = () => {
    if (isSubTimerActive) {
      playToggleOffSound();
      setIsSubTimerActive(false);
      subTimer.clear();
      return;
    }

    playToggleOnSound();
    setIsSubTimerActive(true);
    subTimer.reset();

    if (!mainTimer.isRunning) {
      subTimer.togglePause();
    }
  };

  const handleTogglePause = () => {
    const willPause = mainTimer.isRunning;

    if (willPause) {
      playToggleOffSound();
    } else {
      playToggleOnSound();
    }

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
            strokeWidth={12}
            stroke="#ff0084"
            viewBoxSize={140}
          />
        )}
      </TimerRound>
      <Timer15Button isActive={isSubTimerActive} onClick={handle15Click} />
      <TimerResetButton onClick={handleReset} />
      <TimerPauseButton
        label={mainTimer.isRunning ? "PAUSE" : "PLAY"}
        onClick={handleTogglePause}
      />
      <TimerSoundButton isMuted={isMuted} onClick={toggleSoundMute} />
    </div>
  );
}

export default Timer;
