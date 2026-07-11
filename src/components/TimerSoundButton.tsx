import { Volume2, VolumeX } from "lucide-react";
import "./TimerSoundButton.scss";

type TimerSoundButtonProps = {
  isMuted: boolean;
  onClick: () => void;
};

function TimerSoundButton({ isMuted, onClick }: TimerSoundButtonProps) {
  return (
    <button
      type="button"
      className="timer-sound-btn"
      onClick={onClick}
      aria-pressed={isMuted}
      aria-label={isMuted ? "ミュート解除" : "ミュート"}
    >
      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}

export default TimerSoundButton;
