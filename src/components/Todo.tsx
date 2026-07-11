import { useMemo, useState } from "react";
import TodoAddButton from "./TodoAddButton";
import TodoList from "./TodoList";
import { useTodoDragReorder } from "../hooks/useTodoDragReorder";
import { useTodoTransientUi } from "../hooks/useTodoTransientUi";
import { useTodos } from "../hooks/useTodos";
import { playToggleOnSound } from "../utils/playToggleSound";
import type { TodoItemData } from "../types/todo";
import "./Todo.scss";

type TodoProps = {
  initialItems: TodoItemData[];
  onPersist: (items: TodoItemData[]) => void;
};

function Todo({ initialItems, onPersist }: TodoProps) {
  const todos = useTodos(initialItems, onPersist);
  const ui = useTodoTransientUi();
  const [enteringItemId, setEnteringItemId] = useState<string | null>(null);
  const itemIds = useMemo(
    () => todos.items.map((item) => item.id),
    [todos.items],
  );
  const drag = useTodoDragReorder({
    itemIds,
    onReorder: todos.reorderItem,
  });

  const handleAdd = () => {
    playToggleOnSound();
    const newItemId = todos.addItem();
    setEnteringItemId(newItemId);
  };

  const handleDelete = (id: string) => {
    todos.deleteItem(id);
    ui.clearForItem(id);
  };

  return (
    <div className="todo">
      <TodoList
        items={todos.items}
        editingId={ui.editingId}
        openMenuId={ui.openMenuId}
        enteringItemId={enteringItemId}
        draggingId={drag.draggingId}
        dragOffsetY={drag.dragOffsetY}
        onTextChange={todos.updateText}
        onStartEdit={ui.startEdit}
        onStopEdit={ui.stopEditing}
        onToggleMenu={ui.toggleMenu}
        onColorChange={todos.changeColor}
        onDelete={handleDelete}
        onToggleChecked={todos.toggleChecked}
        onItemDragMouseDown={drag.handleItemMouseDown}
        registerItemRef={drag.registerItemRef}
      />
      <TodoAddButton onClick={handleAdd} />
    </div>
  );
}

export default Todo;
