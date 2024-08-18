import { type SidebarItem } from "$/src/utils/types";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { MenuItem } from "react-pro-sidebar";
import { IoMdMore } from "react-icons/io";
import Link from "next/link";

interface Props {
  link: string;
  label: string;
  icon: React.ReactNode;
  menuItems: SidebarItem[];
  active?: boolean;
}

export default function SidebarMenuItem({
  link,
  label,
  icon,
  menuItems,
  active = false,
}: Props) {
  return (
    <div className={`flex w-full flex-row items-center justify-between p-4`}>
      <Link href={link} className="flex w-full flex-row items-center gap-4">
        {icon}
        {label}
      </Link>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="light" isIconOnly>
            <IoMdMore className="hidden group-hover:block" />
          </Button>
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
  );
}
