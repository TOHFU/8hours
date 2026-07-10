import Snd from "snd-lib";
import { playSound } from "../lib/snd";

export function playTapSound(): void {
  playSound(Snd.SOUNDS.TAP);
}
