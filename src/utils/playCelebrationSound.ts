import Snd from "snd-lib";
import { playSound } from "../lib/snd";

export function playCelebrationSound(): void {
  playSound(Snd.SOUNDS.CELEBRATION);
}
