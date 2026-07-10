import Snd from "snd-lib";
import { playSound } from "../lib/snd";

export function playTransitionUpSound(): void {
  playSound(Snd.SOUNDS.TRANSITION_UP);
}

export function playTransitionDownSound(): void {
  playSound(Snd.SOUNDS.TRANSITION_DOWN);
}
