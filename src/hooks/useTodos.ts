import { useCallback, useEffect, useState } from "react";
import {
  createEmptyTodoItem,
  type TodoColor,
  type TodoItemData,
} from "../types/todo";

function updateItemById(
  items: TodoItemData[],
  id: string,
  patch: Partial<TodoItemData>,
): TodoItemData[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function useTodos(
  initialItems: TodoItemData[],
  onPersist: (items: TodoItemData[]) => void,
) {
  const [items, setItems] = useState<TodoItemData[]>(() => initialItems);

  useEffect(() => {
    onPersist(items);
  }, [items, onPersist]);

  const addItem = useCallback((): string => {
    const newItem = createEmptyTodoItem();
    setItems((currentItems) => [...currentItems, newItem]);
    return newItem.id;
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setItems((currentItems) => updateItemById(currentItems, id, { text }));
  }, []);

  const toggleChecked = useCallback((id: string, checked: boolean) => {
    setItems((currentItems) => updateItemById(currentItems, id, { checked }));
  }, []);

  const changeColor = useCallback((id: string, color: TodoColor) => {
    setItems((currentItems) => updateItemById(currentItems, id, { color }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((currentItems) => {
      if (currentItems.length <= 1) {
        return [createEmptyTodoItem()];
      }

      return currentItems.filter((item) => item.id !== id);
    });
  }, []);

  const reorderItem = useCallback((id: string, toIndex: number) => {
    setItems((currentItems) => {
      const fromIndex = currentItems.findIndex((item) => item.id === id);
      const clampedToIndex = Math.max(
        0,
        Math.min(toIndex, currentItems.length - 1),
      );

      if (fromIndex === -1 || fromIndex === clampedToIndex) {
        return currentItems;
      }

      const nextItems = [...currentItems];
      const [movedItem] = nextItems.splice(fromIndex, 1);
      nextItems.splice(clampedToIndex, 0, movedItem);

      return nextItems;
    });
  }, []);

  return {
    items,
    addItem,
    updateText,
    toggleChecked,
    changeColor,
    deleteItem,
    reorderItem,
  };
}
