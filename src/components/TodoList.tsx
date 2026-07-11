import type { MouseEvent as ReactMouseEvent } from "react";
import type { TodoColor, TodoItemData } from "../types/todo";
import TodoItem from "./TodoItem";
import "./TodoList.scss";

type TodoListProps = {
  items: TodoItemData[];
  editingId: string | null;
  openMenuId: string | null;
  enteringItemId: string | null;
  draggingId: string | null;
  dragOffsetY: number;
  onTextChange: (id: string, text: string) => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onToggleMenu: (id: string) => void;
  onColorChange: (id: string, color: TodoColor) => void;
  onDelete: (id: string) => void;
  onToggleChecked: (id: string, checked: boolean) => void;
  onItemDragMouseDown: (id: string, event: ReactMouseEvent) => void;
  registerItemRef: (id: string, element: HTMLElement | null) => void;
};

function TodoList({
  items,
  editingId,
  openMenuId,
  enteringItemId,
  draggingId,
  dragOffsetY,
  onTextChange,
  onStartEdit,
  onStopEdit,
  onToggleMenu,
  onColorChange,
  onDelete,
  onToggleChecked,
  onItemDragMouseDown,
  registerItemRef,
}: TodoListProps) {
  return (
    <ul className="todo-list">
      {items.map((item) => (
        <TodoItem
          key={item.id}
          item={item}
          isEditing={editingId === item.id}
          isMenuOpen={openMenuId === item.id}
          startFolded={item.id === enteringItemId}
          skipDeleteAnimation={items.length === 1}
          isDragging={draggingId === item.id}
          dragOffsetY={draggingId === item.id ? dragOffsetY : 0}
          onTextChange={(text) => onTextChange(item.id, text)}
          onStartEdit={() => onStartEdit(item.id)}
          onStopEdit={onStopEdit}
          onToggleMenu={() => onToggleMenu(item.id)}
          onColorChange={(color) => onColorChange(item.id, color)}
          onDelete={() => onDelete(item.id)}
          onToggleChecked={(checked) => onToggleChecked(item.id, checked)}
          onDragMouseDown={(event) => onItemDragMouseDown(item.id, event)}
          itemRef={(element) => registerItemRef(item.id, element)}
        />
      ))}
    </ul>
  );
}

export default TodoList;
