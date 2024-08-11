/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  type StatusCode,
  type KanbanCardData,
  type SidebarItem,
} from "$/src/utils/types";
import { createContext } from "react";

export type KanbanContextData = {
  todoItems: KanbanCardData[];
  inProgressItems: KanbanCardData[];
  doneItems: KanbanCardData[];
  approvedItems: KanbanCardData[];
  actionBarItems: SidebarItem[];
  createCard: () => void;
  editCard: (cardData: KanbanCardData) => void;
  deleteCard: (cardData: KanbanCardData) => void;
  moveCard: (cardData: KanbanCardData, status: StatusCode) => void;
};

export const KanbanContext = createContext<KanbanContextData | null>(null);
