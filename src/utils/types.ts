/* eslint-disable @typescript-eslint/no-explicit-any */
import { type SVGProps } from "react";
import { expenseTypes, type roomTypes } from "./utils";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  callback(arg?: any): void;
  class?: string;
}

export type Response = {
  message: string;
  success: boolean;
  data: unknown;
  cursor?: string | undefined;
};

type Period = {
  start: Date;
  end: Date;
};

export type ListingSummary = {
  suburbName?: string;
  suburbId?: number;
  period?: Period;
  averageListingPrice?: number;
  averageSoldPrice?: number;
  averageListingTime?: number;
};

export type Feature = {
  id: number;
  icon: React.ReactNode;
  title: string;
  paragraph: string;
};

export type Testimonial = {
  id: number;
  name: string;
  designation: string;
  content: string;
  image: string;
  star: number;
};

export type StatusCode = "todo" | "inprogress" | "done" | "approved";
export type Status = {
  label: string;
  code: StatusCode;
  color:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "secondary"
    | "danger"
    | undefined;
};

export type StatusDataMap = {
  [key in StatusCode]: Status;
};

export type UserRoleCode = "owner" | "admin" | "guest" | "employee";
export type UserRole = {
  label: string;
  code: UserRoleCode;
  color: "default" | "primary" | "success" | "secondary" | undefined;
};
export type UserRoleDataMap = {
  [key in UserRoleCode]: UserRole;
};

export type RoomTypeCode = (typeof roomTypes)[number];

export type RoomType = {
  label: string;
  code: RoomTypeCode;
  color: "default" | "primary" | "success" | "secondary" | undefined;
};
export type RoomTypeDataMap = {
  [key in RoomTypeCode]: RoomType;
};

export type ExpenseTypeCode = (typeof expenseTypes)[number];

export type ExpenseType = {
  label: string;
  code: ExpenseTypeCode;
  color: "default" | "primary" | "success" | "secondary" | undefined;
};
export type ExpenseTypeDataMap = {
  [key in ExpenseTypeCode]: ExpenseType;
};

export type KanbanCardData = {
  id: string;
  title: string;
  description?: string;
  progress?: number;
  status: StatusCode;
  actions: SidebarItem[];
  object: object;
  info?: { icon: React.ReactNode; quantity: number };
};

export type KanbanCardAction = "create" | "update" | "delete";
