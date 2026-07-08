import Snd from "snd-lib";
import { snd } from "../lib/snd";

export function playToggleOnSound(): void {
  snd.play(Snd.SOUNDS.TOGGLE_ON);
}

export function playToggleOffSound(): void {
  snd.play(Snd.SOUNDS.TOGGLE_OFF);
}

export function playToggleSound(): void {
  playToggleOnSound();
}
