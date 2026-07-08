import type { TodoColor, TodoItemData } from "../types/todo";
import TodoItemCheckbox from "./TodoItemCheckbox";
import TodoItemInput from "./TodoItemInput";
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
  return (
    <li className={`todo-item is-${item.color}${item.checked ? " is-checked" : ""}`}>
      <TodoItemInput
        value={item.text}
        isEditing={isEditing}
        onTextChange={onTextChange}
        onStartEdit={onStartEdit}
        onStopEdit={onStopEdit}
      />
      <TodoItemMenu
        isOpen={isMenuOpen}
        onToggleMenu={onToggleMenu}
        onColorChange={onColorChange}
        onDelete={onDelete}
      />
      <TodoItemCheckbox
        checked={item.checked}
        onToggleChecked={onToggleChecked}
      />
    </li>
  );
}

export default TodoItem;
