import Snd from "snd-lib";
import { playSound } from "../lib/snd";

export function playSwipeSound(): void {
  playSound(Snd.SOUNDS.SWIPE);
}
