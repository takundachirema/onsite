import { Button, Card } from "@nextui-org/react";
import { useContext } from "react";
import { KanbanContext } from "$/src/app/organization/context";

export default function KanbanActionbar() {
  const { createCard, actionBarItems } = useContext(KanbanContext)!;

  return (
    <Card className="w-full p-4">
      <div className="flex w-full flex-row justify-start">
        {actionBarItems.map((actionBarItem) => (
          <Button
            key={actionBarItem.label}
            className="flex flex-row items-center gap-2"
            onClick={() => createCard()}
          >
            {actionBarItem.icon}
            {actionBarItem.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
