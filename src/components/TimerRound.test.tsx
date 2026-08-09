import { fireEvent, render, screen } from "@testing-library/react";
import TimerRound from "./TimerRound";

vi.mock("../utils/playTapSound", () => ({
  playTapSound: vi.fn(),
}));

describe("TimerRound", () => {
  it("TimerInput をタップして編集し、blur 時に確定できる", () => {
    const onMainTimeCommit = vi.fn();

    render(
      <TimerRound mainTime="08:00:00" onMainTimeCommit={onMainTimeCommit}>
        <div />
      </TimerRound>,
    );

    const mainInput = screen.getByDisplayValue("08:00:00");
    expect(mainInput).toHaveAttribute("readonly");

    fireEvent.click(mainInput);
    expect(mainInput).not.toHaveAttribute("readonly");

    fireEvent.change(mainInput, { target: { value: "07:30:00" } });
    fireEvent.blur(mainInput);

    expect(onMainTimeCommit).toHaveBeenCalledWith("07:30:00");
  });
});
