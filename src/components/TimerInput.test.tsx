import { fireEvent, render, screen } from "@testing-library/react";
import TimerInput from "./TimerInput";

vi.mock("../utils/playTapSound", () => ({
  playTapSound: vi.fn(),
}));

describe("TimerInput", () => {
  it("Enter を1回押しただけでは編集を終了しない", () => {
    const onStopEdit = vi.fn();
    render(
      <TimerInput
        value="00:30:00"
        isEditing
        onTextChange={vi.fn()}
        onStartEdit={vi.fn()}
        onStopEdit={onStopEdit}
      />,
    );

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

    expect(onStopEdit).not.toHaveBeenCalled();
  });

  it("Enter を連続で2回押すと編集を終了する", () => {
    const onStopEdit = vi.fn();
    render(
      <TimerInput
        value="00:30:00"
        isEditing
        onTextChange={vi.fn()}
        onStartEdit={vi.fn()}
        onStopEdit={onStopEdit}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onStopEdit).toHaveBeenCalledTimes(1);
  });

  it("IME 変換確定中の Enter (isComposing) はカウントしない", () => {
    const onStopEdit = vi.fn();
    render(
      <TimerInput
        value="00:30:00"
        isEditing
        onTextChange={vi.fn()}
        onStartEdit={vi.fn()}
        onStopEdit={onStopEdit}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onStopEdit).not.toHaveBeenCalled();
  });

  it("1回目の Enter の後に文字を入力すると連続カウントがリセットされる", () => {
    const onStopEdit = vi.fn();
    render(
      <TimerInput
        value="00:30:00"
        isEditing
        onTextChange={vi.fn()}
        onStartEdit={vi.fn()}
        onStopEdit={onStopEdit}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "00:20:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onStopEdit).not.toHaveBeenCalled();
  });
});
