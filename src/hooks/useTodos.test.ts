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

  it("reorderItem で並び順を入れ替えられる", () => {
    const onPersist = vi.fn();
    const threeItems = [
      { id: "1", text: "task1", color: "black" as const, checked: false },
      { id: "2", text: "task2", color: "black" as const, checked: false },
      { id: "3", text: "task3", color: "black" as const, checked: false },
    ];
    const { result } = renderHook(() => useTodos(threeItems, onPersist));

    act(() => {
      result.current.reorderItem("1", 2);
    });

    expect(result.current.items.map((item) => item.id)).toEqual([
      "2",
      "3",
      "1",
    ]);

    act(() => {
      result.current.reorderItem("1", 0);
    });

    expect(result.current.items.map((item) => item.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("reorderItem は範囲外の toIndex をクランプする", () => {
    const onPersist = vi.fn();
    const threeItems = [
      { id: "1", text: "task1", color: "black" as const, checked: false },
      { id: "2", text: "task2", color: "black" as const, checked: false },
      { id: "3", text: "task3", color: "black" as const, checked: false },
    ];
    const { result } = renderHook(() => useTodos(threeItems, onPersist));

    act(() => {
      result.current.reorderItem("1", 99);
    });

    expect(result.current.items.map((item) => item.id)).toEqual([
      "2",
      "3",
      "1",
    ]);
  });

  it("存在しない id を指定した reorderItem は何もしない", () => {
    const onPersist = vi.fn();
    const { result } = renderHook(() => useTodos(initialItems, onPersist));

    act(() => {
      result.current.reorderItem("missing", 0);
    });

    expect(result.current.items).toEqual(initialItems);
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
