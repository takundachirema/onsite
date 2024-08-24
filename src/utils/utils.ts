import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type UserRoleDataMap, type StatusDataMap } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusDataMap: StatusDataMap = {
  todo: { label: "To Do", code: "todo", color: "default" },
  inprogress: { label: "In Progress", code: "inprogress", color: "warning" },
  done: { label: "Done", code: "done", color: "secondary" },
  approved: { label: "Approved", code: "approved", color: "success" },
};

export const roleDataMap: UserRoleDataMap = {
  owner: { label: "Owner", code: "owner", color: "success" },
  admin: { label: "Admin", code: "admin", color: "primary" },
  guest: { label: "Guest", code: "guest", color: "secondary" },
  employee: { label: "Employee", code: "employee", color: "default" },
};

export const roomTypes = [
  "foyer",
  "lounge",
  "passage",
  "kitchen",
  "diningroom",
  "bedroom",
  "bathroom",
  "study",
  "basement",
  "laundy",
  "gym",
  "garage",
  "other",
] as const;
