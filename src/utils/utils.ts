import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  type UserRoleDataMap,
  type StatusDataMap,
  type ExpenseTypeDataMap,
} from "./types";

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

export const expenseTypeDataMap: ExpenseTypeDataMap = {
  material: { label: "Material", code: "material", color: "success" },
  labour: { label: "Labour", code: "labour", color: "primary" },
  fee: { label: "Fee", code: "fee", color: "secondary" },
  other: { label: "Other", code: "other", color: "default" },
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

export const expenseTypes = ["material", "labour", "fee", "other"] as const;
