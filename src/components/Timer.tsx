import { useEffect, useState } from "react";
import {
  EIGHT_HOURS_MS,
  FIFTEEN_MINUTES_MS,
  useTimer,
} from "../hooks/useTimer";
import { playToggleSound } from "../utils/playToggleSound";
import TimerArc from "./TimerArc";
import TimerRound from "./TimerRound";
import "./Timer.scss";

function Timer() {
  const mainTimer = useTimer({ totalMs: EIGHT_HOURS_MS });
  const subTimer = useTimer({
    totalMs: FIFTEEN_MINUTES_MS,
    autoStart: false,
  });
  const [isSubTimerActive, setIsSubTimerActive] = useState(false);

  useEffect(() => {
    if (subTimer.isFinished) {
      setIsSubTimerActive(false);
    }
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

    if (!mainTimer.isRunning && mainTimer.remainingMs > 0) {
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
