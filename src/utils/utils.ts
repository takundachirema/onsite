import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type StatusData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusData: StatusData = {
  todo: { label: "To Do", code: "todo", color: "default" },
  inprogress: { label: "In Progress", code: "inprogress", color: "warning" },
  done: { label: "Done", code: "done", color: "secondary" },
  approved: { label: "Approved", code: "approved", color: "success" },
};
