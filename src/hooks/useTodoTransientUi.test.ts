import { act, renderHook } from "@testing-library/react";
import { useTodoTransientUi } from "./useTodoTransientUi";

describe("useTodoTransientUi", () => {
  it("編集とメニューの開閉を管理できる", () => {
    const { result } = renderHook(() => useTodoTransientUi());

    act(() => {
      result.current.startEdit("todo-1");
    });

    expect(result.current.editingId).toBe("todo-1");

    act(() => {
      result.current.toggleMenu("todo-1");
    });

    expect(result.current.openMenuId).toBe("todo-1");

    act(() => {
      result.current.toggleMenu("todo-1");
    });

    expect(result.current.openMenuId).toBeNull();

    act(() => {
      result.current.startEdit("todo-1");
      result.current.toggleMenu("todo-2");
    });

    expect(result.current.openMenuId).toBe("todo-2");

    act(() => {
      result.current.clearForItem("todo-1");
    });

    expect(result.current.editingId).toBeNull();
    expect(result.current.openMenuId).toBe("todo-2");
  });

  it("TODO 入力以外をクリックすると編集を終了する", () => {
    const { result } = renderHook(() => useTodoTransientUi());

    act(() => {
      result.current.startEdit("todo-1");
    });

    act(() => {
      document.body.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true }),
      );
    });

    expect(result.current.editingId).toBeNull();
  });
});
