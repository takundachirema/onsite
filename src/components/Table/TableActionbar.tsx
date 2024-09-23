import { type SidebarItem } from "$/src/utils/types";
import { Button, Card } from "@nextui-org/react";

export default function TableActionbar({
  actionBarItems,
}: {
  actionBarItems: SidebarItem[];
}) {
  return (
    <Card className="w-full flex-shrink-0 p-4">
      <div className="flex w-full flex-row justify-start">
        {actionBarItems.map((actionBarItem) => (
          <Button
            key={actionBarItem.label}
            className="flex flex-row items-center gap-2"
            onClick={() => {
              actionBarItem.callback(actionBarItem);
            }}
          >
            {actionBarItem.icon}
            {actionBarItem.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
