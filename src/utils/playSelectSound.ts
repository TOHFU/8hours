import Snd from "snd-lib";
import { playSound } from "../lib/snd";

export function playSelectSound(): void {
  playSound(Snd.SOUNDS.SELECT);
}
