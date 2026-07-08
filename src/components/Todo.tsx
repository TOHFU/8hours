import TodoAddButton from "./TodoAddButton";
import TodoList from "./TodoList";
import { useTodoTransientUi } from "../hooks/useTodoTransientUi";
import { useTodos } from "../hooks/useTodos";
import type { TodoItemData } from "../types/todo";
import "./Todo.scss";

type TodoProps = {
  initialItems: TodoItemData[];
  onPersist: (items: TodoItemData[]) => void;
};

function Todo({ initialItems, onPersist }: TodoProps) {
  const todos = useTodos(initialItems, onPersist);
  const ui = useTodoTransientUi();

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
        onTextChange={todos.updateText}
        onStartEdit={ui.startEdit}
        onStopEdit={ui.stopEditing}
        onToggleMenu={ui.toggleMenu}
        onColorChange={todos.changeColor}
        onDelete={handleDelete}
        onToggleChecked={todos.toggleChecked}
      />
      <TodoAddButton onClick={todos.addItem} />
    </div>
  );
}

export default Todo;
