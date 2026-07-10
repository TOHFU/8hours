import type { MouseEvent } from "react";
import { Ellipsis } from "lucide-react";
import type { TodoColor } from "../types/todo";
import { TODO_COLORS } from "../types/todo";
import { playSelectSound } from "../utils/playSelectSound";
import { playTapSound } from "../utils/playTapSound";
import "./TodoItemMenu.scss";

type TodoItemMenuProps = {
  className?: string;
  isOpen: boolean;
  onToggleMenu: () => void;
  onColorChange: (color: TodoColor) => void;
  onDelete: () => void;
};

function TodoItemMenu({
  className = "todo-item-menu",
  isOpen,
  onToggleMenu,
  onColorChange,
  onDelete,
}: TodoItemMenuProps) {
  const handleMenuClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (!isOpen) {
      playSelectSound();
    }
    onToggleMenu();
  };

  const handleColorClick = (event: MouseEvent, color: TodoColor) => {
    event.stopPropagation();
    playTapSound();
    onColorChange(color);
  };

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`${className}${isOpen ? " is-open" : ""}`}
      onClick={handleMenuClick}
    >
      <Ellipsis className="todo-item-menu-icon" size={12} color="#DDDDDD" />
      <ul className="todo-item-menu-list">
        {TODO_COLORS.map((color) => (
          <li
            key={color}
            className={`todo-item-menu-list-item circle circle-${color}`}
            onClick={(event) => handleColorClick(event, color)}
          />
        ))}
        <li
          className="todo-item-menu-list-item delete"
          onClick={handleDeleteClick}
        >
          DELETE
        </li>
      </ul>
    </div>
  );
}

export default TodoItemMenu;
