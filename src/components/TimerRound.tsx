import type { ReactNode } from "react";
import "./TimerRound.scss";

type TimerRoundProps = {
  children: ReactNode;
  mainTime?: string;
  subTime?: string;
  showSubTimer?: boolean;
};

function TimerRound({
  children,
  mainTime = "00:00:00",
  subTime = "00:00:00",
  showSubTimer = false,
}: TimerRoundProps) {
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
          <span className="dial-number dial-number-15">15</span>
        )}
      </div>
      <div className="timer-round-center" data-tauri-drag-region>
        <p className="timer-round-center-time">{mainTime}</p>
        {showSubTimer && (
          <p className="timer-round-center-time time-15">{subTime}</p>
        )}
      </div>
    </div>
  );
}

export default TimerRound;
