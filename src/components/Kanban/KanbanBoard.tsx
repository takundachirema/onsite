/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useContext } from "react";
import { statusDataMap } from "$/src/utils/utils";

import { KanbanContext } from "$/src/context/KanbanContext";
import KanbanActionbar from "$/src/components/Kanban/KanbanActionbar";
import KanbanLane from "$/src/components/Kanban/KanbanLane";

export default function KanbanBoard() {
  const { todoItems, inProgressItems, doneItems, approvedItems } =
    useContext(KanbanContext)!;

  return (
    <div className="flex w-full flex-col gap-4">
      <KanbanActionbar />
      <div className="grid w-full grid-cols-4 space-x-4">
        <KanbanLane status={statusDataMap.todo} items={todoItems} />
        <KanbanLane status={statusDataMap.inprogress} items={inProgressItems} />
        <KanbanLane status={statusDataMap.done} items={doneItems} />
        <KanbanLane status={statusDataMap.approved} items={approvedItems} />
      </div>
    </div>
  );
}
