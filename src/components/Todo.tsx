import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import TodoItem from "./TodoItem";
import { createEmptyTodoItem, type TodoColor } from "../types/todo";
import type { TodoItemData } from "../types/todo";
import "./Todo.scss";

type TodoProps = {
  initialItems: TodoItemData[];
  onPersist: (items: TodoItemData[]) => void;
};

function Todo({ initialItems, onPersist }: TodoProps) {
  const [items, setItems] = useState<TodoItemData[]>(() => initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const stopEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  const dismissTransientUi = useCallback(() => {
    stopEditing();
    closeMenu();
  }, [closeMenu, stopEditing]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (!target.closest(".todo-item-menu")) {
        closeMenu();
      }

      if (target.closest(".todo-item-input")) {
        return;
      }

      stopEditing();
    };

    const handleAppDeactivate = () => {
      dismissTransientUi();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        dismissTransientUi();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("blur", handleAppDeactivate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("blur", handleAppDeactivate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [closeMenu, dismissTransientUi, stopEditing]);

  useEffect(() => {
    onPersist(items);
  }, [items, onPersist]);

  const handleAddItem = () => {
    setItems((currentItems) => [...currentItems, createEmptyTodoItem()]);
  };

  const handleTextChange = (id: string, text: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  const handleToggleChecked = (id: string, checked: boolean) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, checked } : item,
      ),
    );
  };

  const handleColorChange = (id: string, color: TodoColor) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, color } : item)),
    );
  };

  const handleDelete = (id: string) => {
    setItems((currentItems) => {
      if (currentItems.length <= 1) {
        return [createEmptyTodoItem()];
      }

      return currentItems.filter((item) => item.id !== id);
    });
    setOpenMenuId((currentId) => (currentId === id ? null : currentId));
    setEditingId((currentId) => (currentId === id ? null : currentId));
  };

  const handleToggleMenu = (id: string) => {
    setOpenMenuId((currentId) => (currentId === id ? null : id));
  };

  return (
    <div className="todo">
      <ul className="todo-list">
        {items.map((item) => (
          <TodoItem
            key={item.id}
            item={item}
            isEditing={editingId === item.id}
            isMenuOpen={openMenuId === item.id}
            onTextChange={(text) => handleTextChange(item.id, text)}
            onStartEdit={() => setEditingId(item.id)}
            onStopEdit={stopEditing}
            onToggleMenu={() => handleToggleMenu(item.id)}
            onColorChange={(color) => handleColorChange(item.id, color)}
            onDelete={() => handleDelete(item.id)}
            onToggleChecked={(checked) => handleToggleChecked(item.id, checked)}
          />
        ))}
      </ul>
      <button
        type="button"
        className="todo-add-buton"
        aria-label="Add todo"
        onClick={handleAddItem}
      >
        <Plus size={16} color="#EEEEEE" />
      </button>
    </div>
  );
}

export default Todo;
