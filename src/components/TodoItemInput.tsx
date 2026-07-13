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
  // 日本語入力の変換確定用 Enter を編集終了と誤認しないよう、
  // Enter が連続で2回押されたときだけ編集を終了する
  const pendingEnterConfirmRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
    pendingEnterConfirmRef.current = false;
  }, [isEditing]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      pendingEnterConfirmRef.current = false;
      return;
    }

    event.preventDefault();

    if (!pendingEnterConfirmRef.current) {
      pendingEnterConfirmRef.current = true;
      return;
    }

    pendingEnterConfirmRef.current = false;
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
      onChange={(event) => {
        pendingEnterConfirmRef.current = false;
        onTextChange(event.target.value);
      }}
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
