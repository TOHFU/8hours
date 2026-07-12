import { useEffect, useRef, useState } from "react";
import type { DragReorderItemProps } from "../hooks/useDragReorder";
import type { TodoColor, TodoItemData } from "../types/todo";
import { playToggleOffSound } from "../utils/playToggleSound";
import TodoItemCheckbox from "./TodoItemCheckbox";
import TodoItemInput from "./TodoItemInput";
import TodoItemMenu from "./TodoItemMenu";
import "./TodoItem.scss";

const FOLD_ANIMATION_MS = 400;

type TodoItemProps = {
  item: TodoItemData;
  isEditing: boolean;
  isMenuOpen: boolean;
  startFolded?: boolean;
  skipDeleteAnimation?: boolean;
  dragHandleProps?: DragReorderItemProps;
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
  startFolded = false,
  skipDeleteAnimation = false,
  dragHandleProps,
  onTextChange,
  onStartEdit,
  onStopEdit,
  onToggleMenu,
  onColorChange,
  onDelete,
  onToggleChecked,
}: TodoItemProps) {
  const [isFolded, setIsFolded] = useState(startFolded);
  const deleteTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startFolded) {
      return;
    }

    let outerFrameId = 0;
    let innerFrameId = 0;

    outerFrameId = requestAnimationFrame(() => {
      innerFrameId = requestAnimationFrame(() => {
        setIsFolded(false);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrameId);
      cancelAnimationFrame(innerFrameId);
    };
  }, [startFolded]);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current !== null) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = () => {
    playToggleOffSound();

    if (skipDeleteAnimation) {
      onDelete();
      return;
    }

    setIsFolded(true);
    deleteTimeoutRef.current = window.setTimeout(() => {
      deleteTimeoutRef.current = null;
      onDelete();
    }, FOLD_ANIMATION_MS);
  };

  const isDragging = dragHandleProps?.isDragging ?? false;

  return (
    <li
      ref={dragHandleProps?.ref}
      className={`todo-item is-${item.color}${item.checked ? " is-checked" : ""}${isFolded ? " is-folded" : ""}${isDragging ? " is-dragging" : ""}`}
      style={dragHandleProps?.style}
      onMouseDown={dragHandleProps?.onMouseDown}
    >
      <TodoItemInput
        className="todo-item-input"
        value={item.text}
        isEditing={isEditing}
        onTextChange={onTextChange}
        onStartEdit={onStartEdit}
        onStopEdit={onStopEdit}
      />
      <TodoItemMenu
        className="todo-item-menu"
        isOpen={isMenuOpen}
        onToggleMenu={onToggleMenu}
        onColorChange={onColorChange}
        onDelete={handleDelete}
      />
      <TodoItemCheckbox
        className="todo-item-checkbox"
        checked={item.checked}
        onToggleChecked={onToggleChecked}
      />
    </li>
  );
}

export default TodoItem;
