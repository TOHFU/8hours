import { act, renderHook } from "@testing-library/react";
import { useTodos } from "./useTodos";

describe("useTodos", () => {
  const initialItems = [
    { id: "1", text: "task", color: "black" as const, checked: false },
  ];

  it("TODO を追加・更新・削除できる", () => {
    const onPersist = vi.fn();
    const { result } = renderHook(() => useTodos(initialItems, onPersist));

    act(() => {
      result.current.addItem();
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.updateText("1", "updated");
      result.current.toggleChecked("1", true);
      result.current.changeColor("1", "blue");
    });

    expect(result.current.items[0]).toEqual({
      id: "1",
      text: "updated",
      color: "blue",
      checked: true,
    });

    act(() => {
      result.current.deleteItem("1");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).not.toBe("1");
  });

  it("最後の1件を削除すると空の TODO 1件になる", () => {
    const onPersist = vi.fn();
    const { result } = renderHook(() => useTodos(initialItems, onPersist));

    act(() => {
      result.current.deleteItem("1");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe("");
  });

  it("items 変更時に onPersist を呼ぶ", () => {
    const onPersist = vi.fn();
    const { result } = renderHook(() => useTodos(initialItems, onPersist));

    act(() => {
      result.current.addItem();
    });

    expect(onPersist).toHaveBeenCalled();
    const lastCall = onPersist.mock.calls[onPersist.mock.calls.length - 1];
    expect(lastCall?.[0]).toHaveLength(2);
  });
});
