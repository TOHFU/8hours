import "./TimerPauseButton.scss";

type TimerPauseButtonProps = {
  label: "PAUSE" | "PLAY";
  onClick: () => void;
};

function TimerPauseButton({ label, onClick }: TimerPauseButtonProps) {
  return (
    <button type="button" className="timer-pause-btn" onClick={onClick}>
      <span className="timer-pause-btn__label">{label}</span>
    </button>
  );
}

export default TimerPauseButton;
