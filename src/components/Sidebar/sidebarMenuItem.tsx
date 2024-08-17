import { type SidebarItem } from "$/src/utils/types";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { MenuItem } from "react-pro-sidebar";
import { IoMdMore } from "react-icons/io";

interface Props {
  label: string;
  icon: React.ReactNode;
  menuItems: SidebarItem[];
  active?: boolean;
}

export default function SidebarMenuItem({
  label,
  icon,
  menuItems,
  active = false,
}: Props) {
  return (
    <MenuItem active={active} className="group">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          {icon}
          {label}
        </div>
        <Dropdown>
          <DropdownTrigger>
            <div>
              <IoMdMore className="hidden group-hover:block" />
            </div>
          </DropdownTrigger>
          <DropdownMenu className="rounded-none">
            {menuItems.map((menuItem) => (
              <DropdownItem key={menuItem.label}>
                <div className="flex flex-row items-center gap-2">
                  {menuItem.icon}
                  {menuItem.label}
                </div>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </MenuItem>
  );
}
