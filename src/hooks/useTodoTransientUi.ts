import { useCallback, useEffect, useState } from "react";

export function useTodoTransientUi() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const startEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const stopEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  const dismissAll = useCallback(() => {
    stopEditing();
    closeMenu();
  }, [closeMenu, stopEditing]);

  const toggleMenu = useCallback((id: string) => {
    setOpenMenuId((currentId) => (currentId === id ? null : id));
  }, []);

  const clearForItem = useCallback((id: string) => {
    setOpenMenuId((currentId) => (currentId === id ? null : currentId));
    setEditingId((currentId) => (currentId === id ? null : currentId));
  }, []);

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
      dismissAll();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        dismissAll();
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
  }, [closeMenu, dismissAll, stopEditing]);

  return {
    editingId,
    openMenuId,
    startEdit,
    stopEditing,
    toggleMenu,
    clearForItem,
  };
}
