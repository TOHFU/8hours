import type { TodoColor, TodoItemData } from "../types/todo";
import TodoItem from "./TodoItem";
import "./TodoList.scss";

type TodoListProps = {
  items: TodoItemData[];
  editingId: string | null;
  openMenuId: string | null;
  onTextChange: (id: string, text: string) => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onToggleMenu: (id: string) => void;
  onColorChange: (id: string, color: TodoColor) => void;
  onDelete: (id: string) => void;
  onToggleChecked: (id: string, checked: boolean) => void;
};

function TodoList({
  items,
  editingId,
  openMenuId,
  onTextChange,
  onStartEdit,
  onStopEdit,
  onToggleMenu,
  onColorChange,
  onDelete,
  onToggleChecked,
}: TodoListProps) {
  return (
    <ul className="todo-list">
      {items.map((item) => (
        <TodoItem
          key={item.id}
          item={item}
          isEditing={editingId === item.id}
          isMenuOpen={openMenuId === item.id}
          onTextChange={(text) => onTextChange(item.id, text)}
          onStartEdit={() => onStartEdit(item.id)}
          onStopEdit={onStopEdit}
          onToggleMenu={() => onToggleMenu(item.id)}
          onColorChange={(color) => onColorChange(item.id, color)}
          onDelete={() => onDelete(item.id)}
          onToggleChecked={(checked) => onToggleChecked(item.id, checked)}
        />
      ))}
    </ul>
  );
}

export default TodoList;
