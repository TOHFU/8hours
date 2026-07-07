import Snd from "snd-lib";
import { snd } from "../lib/snd";

export function playToggleSound(): void {
  snd.play(Snd.SOUNDS.TOGGLE_ON);
}
