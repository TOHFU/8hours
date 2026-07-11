import { useEffect, useState } from "react";
import { EIGHT_HOURS_MS, THIRTY_MINUTES_MS, useTimer } from "../hooks/useTimer";
import type { PersistedAppState, PersistedTimerState } from "../types/appState";
import {
  playMainTimerEndSound,
  playSubTimerCelebrationSound,
  playSubTimerEndSound,
} from "../utils/playTimerEndSound";
import { useSoundMute } from "../hooks/useSoundMute";
import {
  playToggleOffSound,
  playToggleOnSound,
  playToggleSound,
} from "../utils/playToggleSound";
import Timer25Button from "./Timer25Button";
import TimerArc from "./TimerArc";
import TimerPauseButton from "./TimerPauseButton";
import TimerResetButton from "./TimerResetButton";
import TimerRound from "./TimerRound";
import TimerSoundButton from "./TimerSoundButton";
import "./Timer.scss";

/** サブタイマー: 25分(集中)+5分(休憩)の計30分 */
const SUB_TIMER_BREAK_MS = 5 * 60 * 1000;
const SUB_TIMER_BREAK_THRESHOLD = SUB_TIMER_BREAK_MS / THIRTY_MINUTES_MS;

type TimerProps = {
  initialMainTimer: PersistedTimerState;
  initialSubTimer: PersistedTimerState;
  initialSubTimerActive: boolean;
  onPersist: (
    state: Pick<
      PersistedAppState,
      "mainTimer" | "subTimer" | "isSubTimerActive"
    >,
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
    totalMs: THIRTY_MINUTES_MS,
    autoStart: false,
    initialState: initialSubTimer,
    onNaturalZeroCross: playSubTimerEndSound,
    milestones: [
      {
        atRemainingMs: SUB_TIMER_BREAK_MS,
        onCross: playSubTimerCelebrationSound,
      },
    ],
  });
  const [isSubTimerActive, setIsSubTimerActive] = useState(
    initialSubTimerActive,
  );
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

  const handle25Click = () => {
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
        isSubTimerInBreak={subTimer.progress <= SUB_TIMER_BREAK_THRESHOLD}
      >
        <TimerArc
          progress={mainTimer.progress}
          radius={60}
          strokeWidth={40}
          strokeFrom="#E1FF00"
          viewBoxSize={164}
        />
        {isSubTimerActive && (
          <TimerArc
            progress={subTimer.progress}
            radius={55}
            strokeWidth={12}
            strokeFrom="#ff0084"
            strokeTo="#004FB6"
            strokeToThreshold={SUB_TIMER_BREAK_THRESHOLD}
            viewBoxSize={140}
          />
        )}
      </TimerRound>
      <Timer25Button isActive={isSubTimerActive} onClick={handle25Click} />
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
