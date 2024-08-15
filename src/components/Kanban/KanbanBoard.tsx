/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useContext } from "react";
import { statusData } from "$/src/utils/utils";

import { KanbanContext } from "$/src/app/organization/context";
import KanbanActionbar from "$/src/components/Kanban/KanbanActionbar";
import KanbanLane from "$/src/components/Kanban/KanbanLane";

export default function KanbanBoard() {
  const { todoItems, inProgressItems, doneItems, approvedItems } =
    useContext(KanbanContext)!;

  return (
    <div className="flex w-full flex-col gap-4">
      <KanbanActionbar />
      <div className="grid w-full grid-cols-4 space-x-4">
        <KanbanLane status={statusData.todo} items={todoItems} />
        <KanbanLane status={statusData.inprogress} items={inProgressItems} />
        <KanbanLane status={statusData.done} items={doneItems} />
        <KanbanLane status={statusData.approved} items={approvedItems} />
      </div>
    </div>
  );
}
