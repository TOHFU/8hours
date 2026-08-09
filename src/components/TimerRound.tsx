import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import "./TimerRound.scss";
import TimerInput from "./TimerInput";

type TimerRoundProps = {
  children: ReactNode;
  mainTime?: string;
  subTime?: string;
  showSubTimer?: boolean;
  isSubTimerInBreak?: boolean;
  onMainTimeCommit?: (nextMainTime: string) => void;
  onSubTimeCommit?: (nextSubTime: string) => void;
};

function TimerRound({
  children,
  mainTime = "00:00:00",
  subTime = "00:00:00",
  showSubTimer = false,
  isSubTimerInBreak = false,
  onMainTimeCommit,
  onSubTimeCommit,
}: TimerRoundProps) {
  const [isMainEditing, setIsMainEditing] = useState(false);
  const [mainDraftTime, setMainDraftTime] = useState(mainTime);
  const [isSubEditing, setIsSubEditing] = useState(false);
  const [subDraftTime, setSubDraftTime] = useState(subTime);

  useEffect(() => {
    if (!isMainEditing) {
      setMainDraftTime(mainTime);
    }
  }, [isMainEditing, mainTime]);

  useEffect(() => {
    if (!isSubEditing) {
      setSubDraftTime(subTime);
    }
  }, [isSubEditing, subTime]);

  const stopMainEdit = () => {
    setIsMainEditing(false);
    onMainTimeCommit?.(mainDraftTime);
  };

  const stopSubEdit = () => {
    setIsSubEditing(false);
    onSubTimeCommit?.(subDraftTime);
  };

  return (
    <div className="timer-round">
      <div className="timer-round-dial-hours">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="dial-hour"></span>
        ))}
      </div>
      <div className="timer-round-dial-quarters">
        {Array.from({ length: 32 }).map((_, index) => (
          <span key={index} className="dial-quarter"></span>
        ))}
      </div>
      {children}
      <div className="timer-round-dial-number">
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} className="dial-number"></span>
        ))}
        {showSubTimer && (
          <>
            <span className="dial-number dial-number-30">30</span>
            <span className="dial-number dial-number-25">25</span>
          </>
        )}
      </div>
      <div className="timer-round-center" data-tauri-drag-region>
        <TimerInput
          className="timer-round-center-time"
          value={mainDraftTime}
          isEditing={isMainEditing}
          onTextChange={setMainDraftTime}
          onStartEdit={() => setIsMainEditing(true)}
          onStopEdit={stopMainEdit}
        />
        {showSubTimer && (
          <TimerInput
            className={`timer-round-center-time time-25${
              isSubTimerInBreak ? " time-25-break" : ""
            }`}
            value={subDraftTime}
            isEditing={isSubEditing}
            onTextChange={setSubDraftTime}
            onStartEdit={() => setIsSubEditing(true)}
            onStopEdit={stopSubEdit}
          />
        )}
      </div>
    </div>
  );
}

export default TimerRound;
