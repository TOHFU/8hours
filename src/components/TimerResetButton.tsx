import "./TimerResetButton.scss";

type TimerResetButtonProps = {
  onClick: () => void;
};

function TimerResetButton({ onClick }: TimerResetButtonProps) {
  return (
    <button type="button" className="timer-reset-btn" onClick={onClick}>
      RESET
    </button>
  );
}

export default TimerResetButton;
