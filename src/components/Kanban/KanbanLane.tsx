import { KanbanCardData, Status } from "$/src/utils/types";
import { useDroppable } from "@dnd-kit/core";
import { Button, Card, Chip } from "@nextui-org/react";
import KanbanCard from "./KanbanCard";

interface KanbanLaneProps {
  status: Status;
  items: KanbanCardData[];
}

export default function KanbanLane({ status, items }: KanbanLaneProps) {
  const { setNodeRef } = useDroppable({
    id: status.label,
  });
  return (
    <Card className="flex h-[100%] flex-col p-2">
      <div className="p-2">
        <Chip color={status.color}>{status.label}</Chip>
      </div>
      <div ref={setNodeRef} className="flex flex-col gap-2">
        {items.map((item, key) => (
          <KanbanCard
            cardData={item}
            key={key}
            index={key}
            parent={status.label}
          />
        ))}
      </div>
    </Card>
  );
}
