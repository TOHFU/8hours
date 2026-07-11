import "./Timer25Button.scss";

type Timer25ButtonProps = {
  isActive: boolean;
  onClick: () => void;
};

function Timer25Button({ isActive, onClick }: Timer25ButtonProps) {
  return (
    <button
      type="button"
      className={`timer-25-btn${isActive ? " is-active" : ""}`}
      aria-pressed={isActive}
      onClick={onClick}
    >
      25
    </button>
  );
}

export default Timer25Button;
