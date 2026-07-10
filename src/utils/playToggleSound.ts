import Snd from "snd-lib";
import { playSound } from "../lib/snd";

export function playToggleOnSound(): void {
  playSound(Snd.SOUNDS.TOGGLE_ON);
}

export function playToggleOffSound(): void {
  playSound(Snd.SOUNDS.TOGGLE_OFF);
}

export function playToggleSound(): void {
  playToggleOnSound();
}
