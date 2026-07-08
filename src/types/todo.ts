export type TodoColor = "black" | "red" | "blue" | "yellow" | "pink";

export type TodoItemData = {
  id: string;
  text: string;
  color: TodoColor;
  checked: boolean;
};

export const TODO_COLORS: TodoColor[] = [
  "black",
  "red",
  "blue",
  "yellow",
  "pink",
];

export function createEmptyTodoItem(): TodoItemData {
  return {
    id: crypto.randomUUID(),
    text: "",
    color: "black",
    checked: false,
  };
}
