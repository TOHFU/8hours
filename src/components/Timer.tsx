import TimerArc from "./TimerArc";
import "./Timer.scss";

function Timer() {
  const progress = 0.6;
  const progress15 = 0.7;

  return (
    <div className="timer" data-tauri-drag-region>
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
        <TimerArc
          progress={progress}
          radius={60}
          strokeWidth={40}
          stroke="#E1FF00"
          viewBoxSize={164}
        />
        <TimerArc
          progress={progress15}
          radius={55}
          strokeWidth={10}
          stroke="#ff0084"
          viewBoxSize={140}
        />
        <div className="timer-round-dial-number">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className="dial-number"></span>
          ))}
          <span className="dial-number dial-number-15">15</span>
        </div>
        <div className="timer-round-center" data-tauri-drag-region>
          <p className="timer-round-center-time">00:00:00</p>
        </div>
      </div>
      <button className="timer-15-btn">15</button>
      <button className="timer-reset-btn">RESET</button>
      <button className="timer-pause-btn">PAUSE</button>
    </div>
  );
}

export default Timer;
