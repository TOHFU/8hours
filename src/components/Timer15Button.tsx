import "./Timer15Button.scss";

type Timer15ButtonProps = {
  isActive: boolean;
  onClick: () => void;
};

function Timer15Button({ isActive, onClick }: Timer15ButtonProps) {
  return (
    <button
      type="button"
      className={`timer-15-btn${isActive ? " is-active" : ""}`}
      aria-pressed={isActive}
      onClick={onClick}
    >
      15
    </button>
  );
}

export default Timer15Button;
