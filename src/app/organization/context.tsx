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
  updateCard: (cardData: KanbanCardData) => void;
  deleteCard: (cardData: KanbanCardData) => void;
  moveCard: (cardData: KanbanCardData, status: StatusCode) => void;
  onCreate: (responsePromise: any) => void;
  onUpdate: (responsePromise: any) => void;
  onDelete: (responsePromise: any) => void;
};

export const KanbanContext = createContext<KanbanContextData | null>(null);
