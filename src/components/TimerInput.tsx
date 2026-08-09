import { useEffect, useRef } from "react";
import useImeSafeDoubleEnterConfirm from "../hooks/useImeSafeDoubleEnterConfirm";
import { playTapSound } from "../utils/playTapSound";
import "./TimerInput.scss";

type TimerInputProps = {
  className?: string;
  value: string;
  isEditing: boolean;
  onTextChange: (text: string) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
};

function TimerInput({
  className = "timer-input",
  value,
  isEditing,
  onTextChange,
  onStartEdit,
  onStopEdit,
}: TimerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleKeyDown, resetPendingConfirm } =
    useImeSafeDoubleEnterConfirm<HTMLInputElement>({
      onConfirm: onStopEdit,
    });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
    resetPendingConfirm();
  }, [isEditing, resetPendingConfirm]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      className={/\btimer-input\b/.test(className) ? className : `${className} timer-input`}
      onChange={(event) => {
        resetPendingConfirm();
        onTextChange(event.target.value);
      }}
      onClick={() => {
        if (!isEditing) {
          playTapSound();
          onStartEdit();
        }
      }}
      onBlur={() => {
        if (isEditing) {
          onStopEdit();
        }
      }}
      onKeyDown={handleKeyDown}
    />
  );
}

export default TimerInput;
