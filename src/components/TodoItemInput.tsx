import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { playTapSound } from "../utils/playTapSound";
import "./TodoItemInput.scss";

type TodoItemInputProps = {
  className?: string;
  value: string;
  isEditing: boolean;
  onTextChange: (text: string) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
};

function TodoItemInput({
  className = "todo-item-input",
  value,
  isEditing,
  onTextChange,
  onStartEdit,
  onStopEdit,
}: TodoItemInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    onStopEdit();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      placeholder="What needs to be done?"
      className={className}
      readOnly={!isEditing}
      onChange={(event) => onTextChange(event.target.value)}
      onDoubleClick={() => {
        if (!isEditing) {
          playTapSound();
          onStartEdit();
        }
      }}
      onBlur={onStopEdit}
      onKeyDown={handleKeyDown}
    />
  );
}

export default TodoItemInput;
