import { type SidebarItem } from "$/src/utils/types";
import {
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { MenuItem } from "react-pro-sidebar";
import { IoMdMore } from "react-icons/io";
import { type IconType } from "react-icons/lib";
import Container from "./Common/Container";

export default function Actionbar({
  label,
  icon,
  actionBarItems,
}: {
  label: string;
  icon: React.ReactNode;
  actionBarItems: SidebarItem[];
}) {
  return (
    <Card className="w-full">
      <div className="flex w-full flex-row justify-start">
        {actionBarItems.map((actionBarItem) => (
          <div className="flex flex-row items-center gap-2">
            {actionBarItem.icon}
            {actionBarItem.label}
          </div>
        ))}
      </div>
    </Card>
  );
}
