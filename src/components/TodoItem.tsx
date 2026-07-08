import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { TodoColor, TodoItemData } from "../types/todo";
import { playToggleOffSound, playToggleOnSound } from "../utils/playToggleSound";
import TodoItemMenu from "./TodoItemMenu";
import "./TodoItem.scss";

type TodoItemProps = {
  item: TodoItemData;
  isEditing: boolean;
  isMenuOpen: boolean;
  onTextChange: (text: string) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onToggleMenu: () => void;
  onColorChange: (color: TodoColor) => void;
  onDelete: () => void;
  onToggleChecked: (checked: boolean) => void;
};

function TodoItem({
  item,
  isEditing,
  isMenuOpen,
  onTextChange,
  onStartEdit,
  onStopEdit,
  onToggleMenu,
  onColorChange,
  onDelete,
  onToggleChecked,
}: TodoItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleCheckboxChange = () => {
    const nextChecked = !item.checked;
    if (nextChecked) {
      playToggleOnSound();
    } else {
      playToggleOffSound();
    }
    onToggleChecked(nextChecked);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    onStopEdit();
  };

  return (
    <li className={`todo-item is-${item.color}${item.checked ? " is-checked" : ""}`}>
      <input
        ref={inputRef}
        type="text"
        value={item.text}
        placeholder="What needs to be done?"
        className="todo-item-input"
        readOnly={!isEditing}
        onChange={(event) => onTextChange(event.target.value)}
        onDoubleClick={() => {
          if (!isEditing) {
            onStartEdit();
          }
        }}
        onBlur={onStopEdit}
        onKeyDown={handleInputKeyDown}
      />
      <TodoItemMenu
        isOpen={isMenuOpen}
        onToggleMenu={onToggleMenu}
        onColorChange={onColorChange}
        onDelete={onDelete}
      />
      <input
        type="checkbox"
        className="todo-item-checkbox"
        checked={item.checked}
        onChange={handleCheckboxChange}
      />
    </li>
  );
}

export default TodoItem;
