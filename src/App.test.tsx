import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("@tauri-apps/plugin-notification", () => ({
  isPermissionGranted: vi.fn().mockResolvedValue(true),
  requestPermission: vi.fn().mockResolvedValue("granted"),
  sendNotification: vi.fn(),
}));

describe("App", () => {
  it("9時間タイマーの初期表示を描画する", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "TODO",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("09:00:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "START" })).toBeInTheDocument();
  });

  it("TODO を追加して完了状態を切り替えられる", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("新しいタスク"), {
      target: { value: "テストタスク" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ADD" }));

    const addedTask = screen.getByText("テストタスク");
    expect(addedTask).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(addedTask.closest(".todo-item")).toHaveClass("done");
  });
});
